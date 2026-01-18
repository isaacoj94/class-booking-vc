import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Initialize AI clients
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export type AIModel = 'openai' | 'anthropic';

interface ReminderContext {
  customerName: string;
  className: string;
  instructorName: string;
  classTime: string;
  classDate: string;
  attendanceHistory: {
    recentMisses: number;
    streak: number;
  };
}

/**
 * Generate a personalized class reminder using AI
 */
export async function generateReminder(
  context: ReminderContext,
  model: AIModel = 'openai'
): Promise<string> {
  const prompt = `You are a friendly assistant for a ballet studio. Generate a personalized reminder message for a customer about their upcoming class.

Customer: ${context.customerName}
Class: ${context.className} with ${context.instructorName}
Date: ${context.classDate}
Time: ${context.classTime}
Current streak: ${context.attendanceHistory.streak} weeks
Recent misses: ${context.attendanceHistory.recentMisses}

Generate a friendly, encouraging reminder that:
- Mentions the class name and time
- Is personalized and warm
- If they have a streak, celebrate it
- If they've missed recent classes, gently encourage them to come
- Keeps the message concise (2-3 sentences)

Only return the message, no other text.`;

  try {
    if (model === 'openai' && openai) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 150,
      });

      return completion.choices[0]?.message?.content || '';
    } else if (model === 'anthropic' && anthropic) {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 150,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }],
      });

      return message.content[0].type === 'text' ? message.content[0].text : '';
    } else {
      throw new Error('No AI service configured');
    }
  } catch (error: any) {
    console.error('AI generation error:', error);
    // Fallback to a simple reminder
    return `Hi ${context.customerName}! Just a reminder about your ${context.className} class on ${context.classDate} at ${context.classTime} with ${context.instructorName}. See you there!`;
  }
}

interface RecommendationContext {
  customerName: string;
  pastClasses: string[];
  totalClasses: number;
  preferredTimes: string[];
  availableClasses: Array<{
    name: string;
    instructorName: string;
    time: string;
    date: string;
    difficulty?: string;
  }>;
}

/**
 * Generate personalized class recommendations using AI
 */
export async function generateRecommendations(
  context: RecommendationContext,
  model: AIModel = 'openai'
): Promise<Array<{ class: string; reason: string }>> {
  const prompt = `You are a helpful assistant for a ballet studio. Generate personalized class recommendations for a customer.

Customer: ${context.customerName}
Total classes taken: ${context.totalClasses}
Past classes: ${context.pastClasses.join(', ')}
Preferred times: ${context.preferredTimes.join(', ')}

Available classes:
${context.availableClasses.map((c) => `- ${c.name} with ${c.instructorName} on ${c.date} at ${c.time}`).join('\n')}

Generate 2-3 personalized recommendations. For each recommendation:
- Specify which class to take
- Give a specific reason why it fits them (based on their history, preferred times, skill level, etc.)

Format as JSON array: [{"class": "Class Name", "reason": "Why this class suits them"}]
Only return the JSON array, nothing else.`;

  try {
    if (model === 'openai' && openai) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 300,
        response_format: { type: 'json_object' },
      });

      const response = JSON.parse(completion.choices[0]?.message?.content || '{}');
      return Array.isArray(response.recommendations) ? response.recommendations : [];
    } else if (model === 'anthropic' && anthropic) {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }],
      });

      const text = message.content[0].type === 'text' ? message.content[0].text : '';
      const response = JSON.parse(text);
      return Array.isArray(response.recommendations) ? response.recommendations : [];
    } else {
      throw new Error('No AI service configured');
    }
  } catch (error: any) {
    console.error('AI recommendation error:', error);
    // Fallback: return first available class
    return context.availableClasses.slice(0, 2).map((c) => ({
      class: c.name,
      reason: `This class fits your usual schedule`,
    }));
  }
}

interface ProgressAnalysisContext {
  customerName: string;
  goals: Array<{ goal: string; targetDate: string; status: string }>;
  attendanceSinceGoal: number;
  totalClassesAttended: number;
  classesAttended: Array<{ className: string; date: string }>;
}

/**
 * Analyze progress towards goals using AI
 */
export async function analyzeProgress(
  context: ProgressAnalysisContext,
  model: AIModel = 'openai'
): Promise<{
  analysis: string;
  goalProgress: Array<{ goal: string; progress: string; status: string }>;
}> {
  const prompt = `Analyze a customer's progress toward their ballet goals.

Customer: ${context.customerName}
Goals set: ${context.goals.map((g) => `${g.goal} (target: ${g.targetDate}, status: ${g.status})`).join(', ')}
Classes attended since goal setting: ${context.attendanceSinceGoal}
Total classes attended: ${context.totalClassesAttended}

Recent classes:
${context.classesAttended.map((c) => `- ${c.className} on ${c.date}`).join('\n')}

Provide:
1. An overall analysis of their progress (2-3 sentences)
2. For each goal, assess progress and status (on track, needs improvement, etc.)

Format as JSON:
{
  "analysis": "Overall analysis text",
  "goalProgress": [
    {"goal": "goal text", "progress": "progress assessment", "status": "on track" | "needs improvement" | "completed"}
  ]
}
Only return the JSON, nothing else.`;

  try {
    if (model === 'openai' && openai) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 400,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(completion.choices[0]?.message?.content || '{}');
    } else if (model === 'anthropic' && anthropic) {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 400,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }],
      });

      const text = message.content[0].type === 'text' ? message.content[0].text : '';
      return JSON.parse(text);
    } else {
      throw new Error('No AI service configured');
    }
  } catch (error: any) {
    console.error('AI progress analysis error:', error);
    return {
      analysis: 'Progress analysis unavailable. Continue working toward your goals!',
      goalProgress: context.goals.map((g) => ({
        goal: g.goal,
        progress: 'In progress',
        status: 'on track',
      })),
    };
  }
}
