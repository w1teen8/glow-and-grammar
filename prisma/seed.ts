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

  console.log("Seed complete.");
  console.log(`Founder login: ${teacherEmail} / ${teacherPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
