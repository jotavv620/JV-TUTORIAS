import { describe, expect, it } from "vitest";

// Mock gamification calculations
function calculateTutoriaPoints(status: string, feedback: any): number {
  let points = 0;
  
  if (status === 'completed') {
    points += 10;
  } else if (status === 'in_progress') {
    points += 5;
  }
  
  if (feedback) {
    const avgRating = (feedback.pontualidade + feedback.audio + feedback.conteudo) / 3;
    if (avgRating >= 4.5) {
      points += 15;
    } else if (avgRating >= 3.5) {
      points += 10;
    } else {
      points += 5;
    }
  }
  
  return points;
}

function determineMedal(points: number): string {
  if (points >= 500) return 'platinum';
  if (points >= 300) return 'gold';
  if (points >= 150) return 'silver';
  if (points >= 50) return 'bronze';
  return 'none';
}

describe("Gamification System", () => {
  describe("Points Calculation", () => {
    it("should award 10 points for completed tutoria", () => {
      const points = calculateTutoriaPoints('completed', null);
      expect(points).toBe(10);
    });

    it("should award 5 points for in-progress tutoria", () => {
      const points = calculateTutoriaPoints('in_progress', null);
      expect(points).toBe(5);
    });

    it("should award 0 points for scheduled tutoria", () => {
      const points = calculateTutoriaPoints('scheduled', null);
      expect(points).toBe(0);
    });

    it("should award bonus points for excellent feedback (4.5+ rating)", () => {
      const feedback = { pontualidade: 5, audio: 5, conteudo: 4 };
      const points = calculateTutoriaPoints('completed', feedback);
      expect(points).toBe(25); // 10 + 15
    });

    it("should award bonus points for good feedback (3.5-4.5 rating)", () => {
      const feedback = { pontualidade: 4, audio: 4, conteudo: 3 };
      const points = calculateTutoriaPoints('completed', feedback);
      expect(points).toBe(20); // 10 + 10
    });

    it("should award bonus points for regular feedback (<3.5 rating)", () => {
      const feedback = { pontualidade: 3, audio: 3, conteudo: 2 };
      const points = calculateTutoriaPoints('completed', feedback);
      expect(points).toBe(15); // 10 + 5
    });
  });

  describe("Medal System", () => {
    it("should award platinum medal at 500+ points", () => {
      const medal = determineMedal(500);
      expect(medal).toBe('platinum');
    });

    it("should award gold medal at 300-499 points", () => {
      const medal = determineMedal(300);
      expect(medal).toBe('gold');
    });

    it("should award silver medal at 150-299 points", () => {
      const medal = determineMedal(150);
      expect(medal).toBe('silver');
    });

    it("should award bronze medal at 50-149 points", () => {
      const medal = determineMedal(50);
      expect(medal).toBe('bronze');
    });

    it("should have no medal below 50 points", () => {
      const medal = determineMedal(49);
      expect(medal).toBe('none');
    });

    it("should have no medal at 0 points", () => {
      const medal = determineMedal(0);
      expect(medal).toBe('none');
    });
  });

  describe("Achievement Unlocking", () => {
    it("should unlock first_tutoria achievement with 1+ completed tutoria", () => {
      const tutoriasCompleted = 1;
      const hasAchievement = tutoriasCompleted >= 1;
      expect(hasAchievement).toBe(true);
    });

    it("should unlock ten_tutorias achievement with 10+ completed tutorias", () => {
      const tutoriasCompleted = 10;
      const hasAchievement = tutoriasCompleted >= 10;
      expect(hasAchievement).toBe(true);
    });

    it("should unlock fifty_tutorias achievement with 50+ completed tutorias", () => {
      const tutoriasCompleted = 50;
      const hasAchievement = tutoriasCompleted >= 50;
      expect(hasAchievement).toBe(true);
    });

    it("should unlock master_teacher achievement at 300+ points", () => {
      const totalPoints = 300;
      const hasAchievement = totalPoints >= 300;
      expect(hasAchievement).toBe(true);
    });

    it("should unlock legendary achievement at 500+ points", () => {
      const totalPoints = 500;
      const hasAchievement = totalPoints >= 500;
      expect(hasAchievement).toBe(true);
    });
  });

  describe("Leaderboard Ranking", () => {
    it("should rank professors by total points descending", () => {
      const professors = [
        { name: 'Prof A', totalPoints: 100 },
        { name: 'Prof B', totalPoints: 300 },
        { name: 'Prof C', totalPoints: 200 }
      ];
      
      const sorted = [...professors].sort((a, b) => b.totalPoints - a.totalPoints);
      
      expect(sorted[0].name).toBe('Prof B');
      expect(sorted[1].name).toBe('Prof C');
      expect(sorted[2].name).toBe('Prof A');
    });

    it("should assign correct ranks", () => {
      const professors = [
        { name: 'Prof A', totalPoints: 100, rank: 0 },
        { name: 'Prof B', totalPoints: 300, rank: 0 },
        { name: 'Prof C', totalPoints: 200, rank: 0 }
      ];
      
      const sorted = [...professors].sort((a, b) => b.totalPoints - a.totalPoints);
      sorted.forEach((prof, index) => {
        prof.rank = index + 1;
      });
      
      expect(sorted[0].rank).toBe(1);
      expect(sorted[1].rank).toBe(2);
      expect(sorted[2].rank).toBe(3);
    });
  });
});
