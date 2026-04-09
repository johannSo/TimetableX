import SuccessView from './success-view';

interface SuccessPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const checkoutId = typeof params?.checkout_id === 'string'
    ? params.checkout_id
    : Array.isArray(params?.checkout_id)
      ? params.checkout_id[0]
      : undefined;

  return <SuccessView checkoutId={checkoutId} />;
}
