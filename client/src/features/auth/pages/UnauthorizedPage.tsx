import { Link } from "react-router-dom";

const UnauthorizedPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">

      <h1 className="text-6xl font-bold text-red-600">
        403
      </h1>

      <h2 className="mt-4 text-2xl font-semibold">
        Unauthorized Access
      </h2>

      <p className="mt-3 text-gray-600">
        Your account does not have access, or its profile could not be found.
      </p>

      <Link
        to="/"
        className="mt-8 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
      >
        Go Home
      </Link>
    </div>
  );
};

export default UnauthorizedPage;