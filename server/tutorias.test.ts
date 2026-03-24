import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "test",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Tutorias Router", () => {
  it("should list tutorias for a user (returns array)", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tutorias.list();
    
    expect(Array.isArray(result)).toBe(true);
  });

  it("should create a new tutoria with valid input", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tutorias.create({
      disciplina: "Matemática",
      professor: "Dr. Silva",
      instituicao: "Campus A",
      tutor: "João Santos",
      data: "2026-03-25",
      horario: "14:00",
      horarioTermino: "15:30",
    });

    expect(result).toBeDefined();
  });
});

describe("Configuration Router", () => {
  it("should list disciplinas (returns array)", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.config.getDisciplinas();
    
    expect(Array.isArray(result)).toBe(true);
  });

  it("should create a disciplina with valid input", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.config.createDisciplina({
      nome: "Química",
    });

    expect(result).toBeDefined();
  });

  it("should list professores (returns array)", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.config.getProfessores();
    
    expect(Array.isArray(result)).toBe(true);
  });

  it("should create a professor with valid input", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.config.createProfessor({
      nome: "Prof. João",
    });

    expect(result).toBeDefined();
  });

  it("should list instituicoes (returns array)", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.config.getInstituicoes();
    
    expect(Array.isArray(result)).toBe(true);
  });

  it("should create an instituicao with valid input", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.config.createInstituicao({
      nome: "Campus D",
    });

    expect(result).toBeDefined();
  });
});

describe("Relatorios Router", () => {
  it("should get ranking of professors (returns array)", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.relatorios.getRanking();
    
    expect(Array.isArray(result)).toBe(true);
  });

  it("should export PDF data with timestamp", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.relatorios.exportPDF();
    
    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.timestamp).toBeDefined();
    expect(typeof result.timestamp).toBe('string');
  });
});

describe("Auth Router", () => {
  it("should return current user from me query", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();
    
    expect(result).toBeDefined();
    expect(result?.id).toBe(1);
    expect(result?.name).toBe("Test User 1");
  });

  it("should logout successfully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();
    
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });
});
