import type { DiscordEmbed, DiscordMessage, BasePayload } from "../types";
import { Config } from "../config";
import { Logger } from "./logger";

/**
 * Discord Webhook Utilities
 */
export class Webhook {
  /**
   * Send message to Discord webhook
   */
  public static async send(embed: DiscordEmbed): Promise<void> {
    try {
      const webhookUrl = Config.get<string>("discord", "webhook_url");
      
      if (!webhookUrl) {
        throw new Error("Discord webhook URL not configured");
      }

      const message: DiscordMessage = {
        embeds: [embed],
      };

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Discord API error: ${response.status} - ${errorText}`);
      }

      Logger.log("Successfully sent Discord message");
    } catch (error) {
      Logger.error(`Failed to send Discord message: ${error}`);
      throw error;
    }
  }

  /**
   * Get default embed properties from sender
   */
  public static getDefaults(sender: BasePayload["sender"]): Partial<DiscordEmbed> {
    return {
      timestamp: new Date().toISOString(),
      author: {
        name: sender.login,
        url: sender.html_url,
        icon_url: sender.avatar_url,
      },
    };
  }

  /**
   * Truncate text to specified length
   */
  public static truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 3) + "...";
  }

  /**
   * Format file changes summary
   */
  public static formatFileChanges(added: string[], modified: string[], removed: string[]): string {
    const parts: string[] = [];
    
    if (added.length > 0) {
      parts.push(`+ ${added.length} added`);
    }
    
    if (modified.length > 0) {
      parts.push(`~ ${modified.length} modified`);
    }
    
    if (removed.length > 0) {
      parts.push(`- ${removed.length} removed`);
    }

    return parts.join(", ");
  }

  /**
   * Get status text for workflow conclusions
   */
  public static getStatusText(conclusion?: string): string {
    switch (conclusion) {
      case "success":
        return "SUCCESS";
      case "failure":
        return "FAILURE";
      case "cancelled":
        return "CANCELLED";
      case "skipped":
        return "SKIPPED";
      default:
        return "PENDING";
    }
  }

  /**
   * Format duration from timestamps
   */
  public static formatDuration(startTime?: string, endTime?: string): string {
    if (!startTime || !endTime) {
      return "Unknown";
    }

    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const duration = Math.floor((end - start) / 1000);

    if (duration < 60) {
      return `${duration}s`;
    } else if (duration < 3600) {
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      return `${minutes}m ${seconds}s`;
    } else {
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  }
}
