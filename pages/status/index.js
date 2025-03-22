import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <DatabaseInfo />
      <Updatedat />
    </>
  );
}

function Updatedat() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let updatedAtText = "e...";

  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
  }

  return <div>Última atualização: {updatedAtText}</div>;
}

function DatabaseInfo() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 10000,
  });

  let databaseInfo = "Carregando...";

  if (!isLoading && data) {
    databaseInfo = (
      <>
        <h2>Database</h2>
        <pre>{JSON.stringify(data.dependecies.database, null, 2)}</pre>
      </>
    );
  }

  return <div>{databaseInfo}</div>;
}
