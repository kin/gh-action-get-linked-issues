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
  const linkingKeywords = ["close", "closes", "closed", "resolve", "resolves", "resolved", "fix", "fixes", "fixed"];
  const linkGroup = `(?:(${linkingKeywords.join('|')}))`;

  function parseLinkedIssues(matchingStrings) {
    return matchingStrings.map(item => item.split(/\s|#/)).map(thing => thing.filter(item => item.match(new RegExp(`[^${linkGroup}]`, 'i'))).flatMap(item => item.split('/')).reverse());
  }

  function linkedIssueDataFor(targetIssue) {
    const body = targetIssue.body;
    const linkRegexp = new RegExp(`${linkGroup} (?:(\\S+\/\\S+))?#(\\d+)`, "gi");
    const linkMatches = body.match(linkRegexp);
    const linkedIssueData = linkMatches ? parseLinkedIssues(linkMatches): [];
    return linkedIssueData;
  }

  async function getIssue(number, repo = repoName, owner = ownerName) {
    return octokit.issues.get({
      owner: owner,
      repo: repo,
      issue_number: number,
    });
  }

  const run = async () => {
    try {
      if (typeof targetIssue === 'undefined') {
	core.setFailed('Event trigger was not of issue or pull request categories. Please ensure workflow only uses these triggers with this action');
	return;
      }
      
      const linkedIssueData = linkedIssueDataFor(targetIssue);
      const issuesRaw = await Promise.all(linkedIssueData.map(issueData => getIssue(...issueData)));
      const issueData = issuesRaw.map(i => i.data);
      const issues = issueData.map(data => { var issueObject = { issue: data };
					     return issueObject;
					   });

      core.info(`Returning ${issues.length} issues`);
      console.log('Linked issue data: ', linkedIssueData);
      console.log('Issue Data: ', issueData);
      console.log('Returned issues', issues);
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
