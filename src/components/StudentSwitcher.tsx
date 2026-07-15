"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

type Student = { id: string; name: string; email: string };

export default function StudentSwitcher() {
  const [students, setStudents] = useState<Student[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId") ?? "";

  useEffect(() => {
    fetch("/api/students")
      .then((r) => r.json())
      .then(setStudents)
      .catch(() => setStudents([]));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set("studentId", id);
    else params.delete("studentId");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      value={studentId}
      onChange={handleChange}
      className="rounded-full border border-olive/30 bg-white px-4 py-1.5 text-sm text-olive-700 outline-none transition focus:border-olive"
    >
      <option value="">Оберіть учня…</option>
      {students.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );
}
