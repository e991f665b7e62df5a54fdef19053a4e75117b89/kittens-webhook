import { Event, EventType, type IssuesPayload } from "../types";
import { Config } from "../config";
import { Webhook } from "../utils/webhook";

/**
 * Issues Event Handler
 */
export class IssuesEvent extends Event {
  constructor() {
    super({
      name: "IssuesEvent",
      events: [EventType.ISSUES],
    });
  }

  public async execute(payload: IssuesPayload): Promise<void> {
    // Check if issues events are enabled
    if (!Config.get<boolean>("events", "issues")) {
      return;
    }

    const config = Config.get("events_config", "issues");
    const { action, issue, repository, sender } = payload;

    // Get action text
    const actionText = this.getActionText(action);

    // Build description
    const description = [
      `Issue **#${issue.number}** ${actionText} in [\`${repository.full_name}\`](${repository.html_url})`,
      "",
      `**${issue.title}**`,
    ];

    // Add issue body if available (truncated)
    if (issue.body && issue.body.trim()) {
      const truncatedBody = Webhook.truncate(issue.body, 300);
      description.push("");
      description.push(`> ${truncatedBody}`);
    }

    // Build embed fields
    const fields = [];

    // Add labels if enabled and available
    if (config.show_labels && issue.labels.length > 0) {
      const labelText = issue.labels
        .map(label => `\`${label.name}\``)
        .join(", ");

      fields.push({
        name: "Labels",
        value: labelText,
        inline: true,
      });
    }

    // Add assignees if enabled and available
    if (config.show_assignees && issue.assignees.length > 0) {
      const assigneeText = issue.assignees
        .map(assignee => `[@${assignee.login}](https://github.com/${assignee.login})`)
        .join(", ");

      fields.push({
        name: "Assignees",
        value: assigneeText,
        inline: true,
      });
    }

    // Add state field
    fields.push({
      name: "State",
      value: issue.state === "open" ? "Open" : "Closed",
      inline: true,
    });

    // Send Discord embed
    await Webhook.send({
      title: `Issue ${actionText}: #${issue.number}`,
      description: [
        `>>> Issue **#${issue.number}** ${actionText} in [\`${repository.full_name}\`](https://github.com/${repository.full_name})`,
        "```diff",
        issue.state === "open" ? "+ Issue opened" : "- Issue closed",
        issue.labels.length > 0 ? `! ${issue.labels.length} ${issue.labels.length === 1 ? "label" : "labels"} applied` : "",
        "```"
      ].filter(line => line !== "").join("\n"),
      color: config.embed_color,
      fields: [
        {
          name: `\`#${issue.number}\``,
          value: `\`\`\`fix\n${issue.title.slice(0, 50 - 3)}${issue.title.length > 50 ? "..." : ""}\n\`\`\``,
          inline: issue.title.length < 50
        }
      ],
      ...Webhook.getDefaults(sender),
    });
  }


  private getActionText(action: string): string {
    switch (action) {
      case "opened":
        return "opened";
      case "closed":
        return "closed";
      case "reopened":
        return "reopened";
      case "labeled":
        return "labeled";
      case "unlabeled":
        return "unlabeled";
      default:
        return action;
    }
  }
}
