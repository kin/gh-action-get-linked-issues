const core = require("@actions/core");
const github = require("@actions/github");
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
  auth: core.getInput('access-token')
});
			    
try {
  const payload = github.context.payload;
  const repo = payload.repository;
  const repoName = repo.name;
  const ownerName = repo.owner.login;
  
  const pullRequest = payload.pull_request;
  
  function linkedIssueNumbersFor(pullRequest) {
    const body = pullRequest.body;
    const linkRegexp = /(?:(close|closes|closed|resolve|resolves|resolved|fix|fixes|fixed)) #\d+/gi;
    const linkMatches = body.match(linkRegexp);
    const issueNumbers = linkMatches ? linkMatches.map(item => parseInt(item.replace(/[^0-9]/g, ""))) : [];
    return issueNumbers;
  }

  async function getIssue(number) {
    return octokit.issues.get({
      owner: ownerName,
      repo: repoName,
      issue_number: number,
    });
  }

  const run = async () => {
    try {
      if (typeof pullRequest === 'undefined') {
	core.setFailed('Could not detect pull_request or pull_request_target event trigger. Please ensure workflow only uses these triggers with this action');
	return;
      }
      
      const issueNumbers = linkedIssueNumbersFor(pullRequest);
      const issuesRaw = await Promise.all(issueNumbers.map(getIssue));
      const issueData = issuesRaw.map(i => i.data);
      const issues = issueData.map(data => { var issueObject = { issue: data };
					     return issueObject;
					   });

      core.info(`Returning ${issues.length} issues`);
      core.setOutput("issues", JSON.stringify(issues), undefined, 2);
    }
    catch (error) {
      core.info(error);
    }
  };

  run();
}
catch (error) {
  core.setFailed(error.message);
};
