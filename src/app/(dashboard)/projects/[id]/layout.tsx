import { ProjectTabs } from "@/components/project/project-tabs"

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="flex flex-col gap-6">
      <ProjectTabs projectId={id} activeTab="dpgf" />
      {children}
    </div>
  )
}
