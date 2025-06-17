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
    const repo = context.repo.repo;
    const owner = context.repo.owner;
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    const communityWebhookUrl = process.env.SLACK_COMMUNITY_NOTIFICATIONS_WEBHOOK_URL;

    const Maintainers = ['user1', 'user2', 'user3'];

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
      /*bot reply code here



      */


      message = `*[${repo}] New comment on issue: <${issueUrl}#issuecomment-${commentId}|${escapedTitle} by ${commentAuthor}>*`.replace(/"/g, '\\"');
      core.setOutput('webhook_url', communityWebhookUrl);
    }

    core.setOutput('text', message);

  } catch (error) {
    core.setFailed(`Action failed with error: ${error.message}`);
  }
};
