import DocumentRelatedByAuthor from "@/modules/user/documents/detail/pages/DocumentRelatedByAuthor";

interface Props {
  readonly params: Promise<{ authorId: string }>;
}

export default async function DocumentRelatedByAuthorPage({
  params,
}: Props): Promise<React.JSX.Element> {
  const { authorId } = await params;
  return <DocumentRelatedByAuthor authorId={authorId} />;
}
