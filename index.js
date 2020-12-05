const core = require("@actions/core");
const github = require("@actions/github");
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
  auth: core.getInput('access-token')
});
			    
try {
  const owner = github.repository_owner;
  const repo = github.repository;
  const eventTarget = github.event;
  const pr = eventTarget.pull_request;
  
  async function getPullRequest(number) {
    return octokit.pulls.get({
    owner: owner,
    repo: repo,
    pull_number: number,
    });
  }

  function linkedIssueNumbersFor(pullRequest) {
    const body = pullRequest.body;
    const issueNumbers = body.match(/(?:(resolves|fixes)) #\d+/gi).map(item => parseInt(item.replace(/[^0-9]/g, "")));
    return issueNumbers;
  }

  async function getIssue(number) {
    return octokit.issues.get({
      owner: owner,
      repo: repo,
      issue_number: number,
    });
  }

  const run = async () => {
    try {
      if (typeof pr === 'undefined') {
	core.setFailed('Could not detect pull_request or pull_request_target event trigger. Please ensure workflow only uses these triggers with this action');
      } else {
	const { data: pullRequest } = await getPullRequest(pr.number);
	const issueNumbers = linkedIssueNumbersFor(pullRequest);
	const issuesRaw = await Promise.all(issueNumbers.map(getIssue));
	const issues = issuesRaw.map(i => i.data);

	core.setOutput("issues", issues);
	console.log(`Returning ${issues.length} issues`);
      }
    }
    catch (error) {
      console.log(error);
    }
  };

  run();
}
catch (error) {
  core.setFailed(error.message);
};
