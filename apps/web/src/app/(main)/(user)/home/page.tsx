import LibraryPage from "@/modules/library/pages/LibraryPage";

interface Props {
  readonly searchParams: Promise<{ subjectId?: string }>;
}

export default async function HomePage({
  searchParams,
}: Props): Promise<React.JSX.Element> {
  const { subjectId = "" } = await searchParams;
  return <LibraryPage initialSubjectId={subjectId} />;
}
