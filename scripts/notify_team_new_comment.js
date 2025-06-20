const fs = require('fs');
const path = require('path');

function hasLabel(labels, name) {
  return labels.some(label => label.toLowerCase() === name.toLowerCase());
}

module.exports = async ({ github, context, core }) => {
  try {
    const issueNumber = context.payload.issue.number;
    const issueUrl = context.payload.issue.html_url;
    const issueTitle = context.payload.issue.title;
    const escapedTitle = issueTitle.replace(/"/g, '\\"');
    const commentId = context.payload.comment.id;
    const commentAuthor = context.payload.comment.user.login;
    const comment = context.payload.comment.body;
    const repo = context.repo.repo;
    const owner = context.repo.owner;
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    const communityWebhookUrl = process.env.SLACK_COMMUNITY_NOTIFICATIONS_WEBHOOK_URL;

    const Maintainers = ['user1', 'user2', 'user3'];
    const keywordsPath = path.join(__dirname, 'keywords.txt');
    const keywords = fs.readFileSync(keywordsPath, 'utf-8')
        .split('\n')
        .map(k => k.trim().toLowerCase())
        .filter(Boolean);

    if (Maintainers.includes(commentAuthor)) {
      core.setOutput('isMaintainer', true);
      return;
    } else {
      core.setOutput('isMaintainer', false);
    }

    const { data: labels } = await github.rest.issues.listLabelsOnIssue({
      owner,
      repo,
      issue_number: issueNumber
    });

    const labelNames = labels.map(label => label.name);
      let message;
    if (hasLabel(labelNames, 'help wanted')) {
      message = `*[${repo}] New comment on issue: <${issueUrl}#issuecomment-${commentId}|${escapedTitle} by ${commentAuthor}>*`;
      core.setOutput('webhook_url', slackWebhookUrl);
    } else {

      const matchedKeywords = keywords.find(keyword => comment.toLowerCase().includes(keyword));
      if(matchedKeywords){
          github.rest.issues.createComment({
              owner,
              repo,
              issue_number: issueNumber,
              body: `Hi @${commentAuthor} 👋

              Thanks so much for your interest! This issue is currently reserved for the core team and isn’t available for assignment right now.

              If you’d like to get started contributing, please take a look at our [Contributing Guidelines](https://github.com/your-org/your-repo/blob/main/CONTRIBUTING.md) for tips on finding “help-wanted” issues, setting up your environment, and submitting a PR.

              We really appreciate your willingness to help — feel free to pick another issue labeled **help-wanted** and let us know if you have any questions. 😊
              `
          });
      }



      message = `*[${repo}] New comment on issue: <${issueUrl}#issuecomment-${commentId}|${escapedTitle} by ${commentAuthor}>*`;
      core.setOutput('webhook_url', communityWebhookUrl);
    }

    core.setOutput('text', message);

  } catch (error) {
    core.setFailed(`Action failed with error: ${error.message}`);
  }
};
