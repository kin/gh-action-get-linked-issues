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
  const targetIssue = typeof pullRequest === 'undefined' ? payload.issue : pullRequest;
  
  function linkedIssueNumbersFor(targetIssue) {
    const body = targetIssue.body;
    const linkRegexp = /(?:(close|closes|closed|resolve|resolves|resolved|fix|fixes|fixed)) #\d+/gi;
    const linkMatches = body.match(linkRegexp);
    const linkedIssueNumbers = linkMatches ? linkMatches.map(item => parseInt(item.replace(/[^0-9]/g, ""))) : [];
    return linkedIssueNumbers;
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
      console.log('Raw Payload: ', payload);
      console.log('Issue: ', payload.issue);
      console.log('Pull Request: ', pullRequest);
      console.log('Target Issue: ', targetIssue);
      console.log('Body: ', targetIssue.body);
      if (typeof targetIssue === 'undefined') {
	core.setFailed('Event trigger was not of issue or pull request categories. Please ensure workflow only uses these triggers with this action');
	return;
      }
      
      const linkedIssueNumbers = linkedIssueNumbersFor(targetIssue);
      const issuesRaw = await Promise.all(linkedIssueNumbers.map(getIssue));
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
