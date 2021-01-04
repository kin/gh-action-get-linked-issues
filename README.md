# Get Linked Issues
<<<<<<< HEAD
A utility that takes a PR and returns the issue object(s) returned by GH API that the PR is linked to.
[Github linking syntax](https://docs.github.com/en/free-pro-team@latest/github/managing-your-work-on-github/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword).

## Workflow Template
This is desinged to be used with other actions that process the returned issues.
=======
A utility to get the issue object(s) returned by GH API for a given PR that links to it using the
[Github linking syntax](https://docs.github.com/en/free-pro-team@latest/github/managing-your-work-on-github/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword).
This will not find issues that are linked through the UI.

## Workflow Template
This action is not useful by itself but provides powerful application to other actions.
>>>>>>> 60ba7d7... Create action
Below is an example workflow YML that moves the project cards for issues linked to the PR into the 'Ready for Review' column when the PR is opened for review.

```
name: Sync Review Status

on:
  # Requires the event trigger to be of type pull_request or pull_request_target
  pull_request_target:
    types: [review_requested]

jobs:
  sync-review-status:
    runs-on: ubuntu-latest
    name: Get Linked Issues
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Get Linked Issues Action
        uses: kin/gh-action-get-linked-issues@v1.0
        id: linked-issues
        with:
          # Required: personal access token with permissions to archive cards
<<<<<<< HEAD
		  access-token: "${{ secrets.GITHUB_TOKEN }}"
=======
>>>>>>> 60ba7d7... Create action

	  - name: Move Issues to Ready for Review Column
	    uses: kin/gh-action-move-issue-to-column@1.0
		with:
		  access-token: "${{ secrets.GITHUB_TOKEN }}"
		  target-column: "Ready for Review"
		  issues: ${{ steps.linked-issues.outputs.issues }}

```
<<<<<<< HEAD

## Inputs
- `access-token`: Access token for repository. Use `"{{ secrets.GITHUB_TOKEN }}"` to prevent leaking secrets.
- It is important to note that this action requires that the workflow trigger event is of the `pull_request` or `pull_request_target` type.

## Outputs
- `issues`: A stringified array of [issue payloads](https://docs.github.com/en/free-pro-team@latest/rest/reference/issues#get-an-issue) with each issue payload formatted as `{ issue: { <payload> } }`

## Known Issues
This will not find issues that are linked through the UI, nor will it find issues linked in repos outside of the one the PR is in. There is a planned fix for both of these issues.

## Contribution
To cotnribute, please open an Issue on the action repo: https://github.com/kin/gh-action-autoarchive-issues-for-column to discuss bugs/modifications.
=======
>>>>>>> 60ba7d7... Create action
