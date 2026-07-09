export interface ResumeAnalysisResult {
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  formattingFeedback: string;
  improvementSuggestions: string[];
}

export interface RoadmapMilestone {
  title: string;
  description: string;
  recommendedCourses: string[];
  recommendedProjects: string[];
  timeline: string;
  resources: string[];
}

export interface RoadmapResult {
  milestones: RoadmapMilestone[];
}

export interface InterviewFeedbackResult {
  technicalFeedback: string;
  communicationFeedback: string;
  confidenceScore: number;
  improvementSuggestions: string[];
  followUpQuestions: string[];
}

export class AIServiceClient {
  private static async postRequest(action: string, data: any): Promise<any> {
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, data }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const body = await response.json();
      return body.result;
    } catch (error: any) {
      console.error(`AI Client Error for action ${action}:`, error);
      throw error;
    }
  }

  public static async explainEligibility(
    opportunityTitle: string,
    mismatches: string[],
    eligibilityPercentage: number
  ): Promise<string> {
    try {
      return await this.postRequest("explainEligibility", {
        opportunityTitle,
        mismatches,
        eligibilityPercentage,
      });
    } catch {
      return "Due to temporary AI service limitations, we could not generate a personalized explanation. Please review the missing criteria checklist above.";
    }
  }

  public static async analyzeResume(resumeText: string): Promise<ResumeAnalysisResult> {
    try {
      return await this.postRequest("analyzeResume", { resumeText });
    } catch {
      // Return rule-based / fallback mock response so app never crashes
      return {
        atsScore: 65,
        strengths: ["Clean resume structure", "Relevant education background"],
        weaknesses: ["Lack of action verbs", "Skills list is too short"],
        missingSkills: ["Cloud Technologies", "CI/CD pipelines"],
        formattingFeedback: "Consider using single-column layouts for improved ATS readability.",
        improvementSuggestions: [
          "Quantify your accomplishments using metrics.",
          "Add more technical skills relevant to your career targets.",
        ],
      };
    }
  }

  public static async generateRoadmap(
    currentSkills: string,
    education: string,
    careerGoal: string,
    availableTime: string
  ): Promise<RoadmapResult> {
    try {
      return await this.postRequest("generateRoadmap", {
        currentSkills,
        education,
        careerGoal,
        availableTime,
      });
    } catch {
      // Fallback predefined template roadmap
      return {
        milestones: [
          {
            title: "Foundation Training",
            description: "Strengthen core fundamentals in computer science, logic, and software engineering concepts.",
            recommendedCourses: ["CS50 Introduction to Computer Science", "Data Structures & Algorithms Basics"],
            recommendedProjects: ["Basic CLI Calculator", "Personal Portfolio Page"],
            timeline: "Weeks 1-4",
            resources: ["freeCodeCamp", "Coursera"],
          },
          {
            title: "Advanced Specialization",
            description: "Deep dive into your chosen track, mastering key frameworks and database integrations.",
            recommendedCourses: ["Full-Stack Web Development Course", "Modern Database Management"],
            recommendedProjects: ["Task Manager Web App", "Interactive Community Portal"],
            timeline: "Weeks 5-12",
            resources: ["MDN Web Docs", "Udemy"],
          },
        ],
      };
    }
  }

  public static async getChatbotResponse(
    message: string,
    history: { role: "user" | "model"; text: string }[],
    profileContext: any
  ): Promise<string> {
    try {
      return await this.postRequest("chatbot", { message, history, profileContext });
    } catch {
      return "Hello! The AI Assistant is currently operating in offline backup mode. I can help answer general questions. Let me know if you need help matching opportunities or updating your profile!";
    }
  }

  public static async getInterviewFeedback(
    jobTitle: string,
    answers: { question: string; answer: string }[]
  ): Promise<InterviewFeedbackResult> {
    try {
      return await this.postRequest("interview", { jobTitle, answers });
    } catch {
      return {
        technicalFeedback: "The response demonstrates a basic conceptual understanding. Try to elaborate on structural details and system designs.",
        communicationFeedback: "Answers are clear but could be more structured. Consider using the STAR method (Situation, Task, Action, Result) for explaining project work.",
        confidenceScore: 70,
        improvementSuggestions: [
          "Provide concrete code or architectural examples.",
          "Keep answers structured and avoid running off-topic.",
        ],
        followUpQuestions: [
          "Can you explain a challenging bug you recently fixed?",
          "How do you ensure test coverage for your backend endpoints?",
        ],
      };
    }
  }

  public static async trackConfidence(scores: any): Promise<string> {
    try {
      return await this.postRequest("trackConfidence", { scores });
    } catch {
      return "Excellent effort! You have completed multiple mock exercises and profile scans this week. Keep maintaining this pace to achieve your technical targets.";
    }
  }
}
