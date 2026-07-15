import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const teacherEmail = process.env.TEACHER_EMAIL ?? "milena@glowandgrammar.com";
  const teacherPassword = process.env.TEACHER_PASSWORD ?? "changeme123";

  const founderBio =
    "Мілєна — засновниця Glow & Grammar та Senior Methodologist з фокусом на підлітках 8–18 років. Поєднує глибоку методологічну підготовку за стандартами Cambridge та Oxford із живою практикою в міжнародному англомовному середовищі, вибудовуючи для кожного учня персональну траєкторію до вільного, впевненого мовлення.";

  const founderSpecialties = "Комунікативна методика, Інтерактивний формат, Швидкий прогрес";

  // Anchor date for the dynamic experience calculation — set so it always
  // computes to "5 years" as of today, never a hardcoded number.
  const founderPracticingSince = new Date("2021-07-09T00:00:00.000Z");

  const teacherProfile = await prisma.teacherProfile.upsert({
    where: { id: "founder-milena" },
    update: { bio: founderBio, specialties: founderSpecialties, practicingSince: founderPracticingSince },
    create: {
      id: "founder-milena",
      name: "Мілєна",
      title: "Засновниця платформи & Senior Methodologist",
      bio: founderBio,
      credentials: [
        "Мовна компетенція: підтверджений рівень C1 Advanced з вільною комунікативною компетенцією.",
        "Офіційна волонтерка American House Kyiv — координація міжнародних розмовних клубів, освітніх подій та нетворкінгу з носіями мови.",
        "Академічна траєкторія: поглиблена підготовка до міжнародного іспиту IELTS Academic, готується до вступу в закордонний заклад вищої освіти.",
        "Методологічна сертифікація: інтенсивне стажування в сертифікованій онлайн-школі преміум-рівня; сучасні комунікативні методики на основі Cambridge та Oxford EFL.",
        "Освітній дизайн: експертиза в інтерактивному дизайні навчання, психологічному трекінгу прогресу та побудові персоналізованих цифрових програм.",
        "Track record: 100% успішних випадків подолання глибинного мовного бар'єру та страху говоріння у підлітків 8–18 років.",
      ].join("\n"),
      philosophy: [
        "Автономність та цифрова екосистема: інтеграція сучасних EdTech-інструментів (Notion-архітектура, авторські Canva-дошки), що передає контроль над домашніми завданнями безпосередньо учню, а не батькам.",
        "Психологічна безпека та висока результативність: середовище високої довіри на основі професійної етики й емоційної безпеки. Помилка — інструмент аналізу й росту, а не привід для страху.",
        "Результат: повна трансформація стосунків учня з англійською мовою, стійкі навички автономного навчання, високе залучення через персоналізовані тематичні модулі та вільне мовлення без психологічного опору.",
      ].join("\n"),
      specialties: founderSpecialties,
      instagram: "https://www.instagram.com/glowwgrammar",
      practicingSince: founderPracticingSince,
      isFounder: true,
      sortOrder: 0,
    },
  });

  const teacherPasswordHash = await bcrypt.hash(teacherPassword, 10);
  await prisma.user.upsert({
    where: { email: teacherEmail },
    // Re-link on rerun too, in case this account predates the profileId column.
    update: { profileId: teacherProfile.id },
    create: {
      email: teacherEmail,
      passwordHash: teacherPasswordHash,
      name: "Мілєна",
      role: "TEACHER",
      profileId: teacherProfile.id,
    },
  });

  const demoPasswordHash = await bcrypt.hash("student123", 10);
  await prisma.user.upsert({
    where: { email: "student@example.com" },
    update: {},
    create: {
      email: "student@example.com",
      passwordHash: demoPasswordHash,
      name: "Демо Учень",
      role: "STUDENT",
      teacherId: teacherProfile.id,
    },
  });

  // A second, non-founder teacher — demonstrates the scoped permission model:
  // this account can only manage homework for students assigned to them.
  const assistantBio =
    "Софія веде розмовну практику та перевіряє домашні завдання для окремої групи учнів Glow & Grammar.";

  const assistantProfile = await prisma.teacherProfile.upsert({
    where: { id: "assistant-demo" },
    update: { bio: assistantBio },
    create: {
      id: "assistant-demo",
      name: "Софія",
      title: "Викладачка розмовної практики",
      bio: assistantBio,
      credentials: "Сертифікат TEFL.\nДосвід викладання розмовної англійської для підлітків.",
      philosophy: "Регулярна практика говоріння в невимушеній, доброзичливій атмосфері.",
      specialties: "Speaking practice, Conversation club",
      practicingSince: new Date("2026-01-01T00:00:00.000Z"),
      isFounder: false,
      sortOrder: 1,
    },
  });

  const assistantPasswordHash = await bcrypt.hash("assistant123", 10);
  await prisma.user.upsert({
    where: { email: "assistant@example.com" },
    update: { profileId: assistantProfile.id },
    create: {
      email: "assistant@example.com",
      passwordHash: assistantPasswordHash,
      name: "Софія",
      role: "TEACHER",
      profileId: assistantProfile.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "student2@example.com" },
    update: {},
    create: {
      email: "student2@example.com",
      passwordHash: await bcrypt.hash("student123", 10),
      name: "Другий Учень",
      role: "STUDENT",
      teacherId: assistantProfile.id,
    },
  });

  console.log("Seed complete.");
  console.log(`Founder login:        ${teacherEmail} / ${teacherPassword}`);
  console.log("Demo student login:   student@example.com / student123");
  console.log("Assistant teacher:    assistant@example.com / assistant123 (only sees student2@example.com)");
  console.log("Second demo student:  student2@example.com / student123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
