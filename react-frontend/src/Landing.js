import { useAuth } from "./context/AuthProvider";
export const Landing = () => {
  const { value } = useAuth();
  return (
    <>
      <h2>Landing (Protected)</h2>
     <div> Authenticated as {value.token}</div>
    </>
  );
};