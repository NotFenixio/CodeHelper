module.exports = (app) => {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const hasGPT4access = process.env.GPT_4_ACCESS;

  async function completeChat(query) {
    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: hasGPT4access ? "gpt-4" : (hasGPT4access === false ? "gpt-3.5-turbo-16k" : "gpt-3.5-turbo-16k"),
          messages: [
            {
              role: 'user',
              content: query,
            },
          ],
          temperature: 1,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const responseData = await response.json();
      return responseData.choices[0].message.content.trim();
    } catch (error) {
      throw new Error(`OpenAI request failed: ${error.message}`);
    }
  }

  async function sendConversationToAPI(context) {
    const issue = context.payload.issue;

    if (context.payload.sender.type === 'Bot') {
      return;
    }

    const conversation = await context.octokit.issues.listComments(context.issue());

    let conversationText = `Root issue by @${issue.user.login}:\n${issue.body}\n`;

    for (const comment of conversation.data) {
      conversationText += `Comment by @${comment.user.login}:\n${comment.body}\n`;
    }

    const response = await completeChat("You're CodeHelper, an AI-powered bot for resolving GitHub issues. You may only respond to issue-related stuff. You should maintain a conversation style, because other people can also comment. You shouldn't say things like \"Let me know if you need...\". You can use Markdown. Conversation to solve:\n" + conversationText);

    const issueComment = context.issue({
      body: response,
    });

    return context.octokit.issues.createComment(issueComment);
  }

  app.log.info("CodeHelper has been loaded!");

  const handleIssueEvent = async (context) => {
    const { title, labels } = context.payload.issue;

    if (title.startsWith("CodeHelper: ") || labels.some((label) => label.name === "codehelper")) {
      await sendConversationToAPI(context);
    }
  };

  app.on("issues.opened", handleIssueEvent);
  app.on("issue_comment.created", handleIssueEvent);
  app.on("issues.labeled", handleIssueEvent);

  app.on('installation.created', async (context) => {
    const { data: installations } = await context.octokit.apps.listReposAccessibleToInstallation({
      installation_id: context.payload.installation.id,
    });

    const label = {
      name: 'codehelper',
      color: '00AAFF',
    };

    for (const repo of installations.repositories) {
      await context.octokit.issues.createLabel({
        owner: repo.owner.login,
        repo: repo.name,
        ...label,
      });
    }
  });
};