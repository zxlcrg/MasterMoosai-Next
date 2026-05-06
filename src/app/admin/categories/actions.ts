"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional().or(z.literal("")),
  icon: z.string().optional().or(z.literal("")),
  color: z.string().optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

function parse(formData: FormData) {
  return schema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    icon: formData.get("icon"),
    color: formData.get("color"),
    sortOrder: formData.get("sortOrder") || 0,
  });
}

export async function createCategory(formData: FormData) {
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;
  const slug = slugify(data.name);

  const existing = await prisma.category.findFirst({
    where: { OR: [{ name: data.name }, { slug }] },
  });
  if (existing) return { error: "A category with this name already exists." };

  await prisma.category.create({
    data: {
      name: data.name,
      slug,
      description: data.description || null,
      icon: data.icon || null,
      color: data.color || null,
      sortOrder: data.sortOrder,
    },
  });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategory(id: number, formData: FormData) {
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  const current = await prisma.category.findUnique({ where: { id } });
  if (!current) return { error: "Category not found." };

  const updateData: any = {
    name: data.name,
    description: data.description || null,
    icon: data.icon || null,
    color: data.color || null,
    sortOrder: data.sortOrder,
  };

  if (current.name !== data.name) {
    updateData.slug = slugify(data.name);
  }

  await prisma.category.update({ where: { id }, data: updateData });
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(id: number) {
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
}
