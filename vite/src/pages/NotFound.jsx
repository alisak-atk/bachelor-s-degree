const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="text-center p-6 sm:p-8 bg-white rounded-lg shadow-lg max-w-sm sm:max-w-md w-full">
        <h1 className="text-5xl sm:text-6xl font-bold text-red-500">404</h1>
        <p className="text-base sm:text-lg text-gray-700 mt-4 font-lao">ຫນ້າທີ່ເຈົ້າກໍາລັງຊອກຫາບໍ່ມີຢູ່.</p>
        <a href="/dashboard" className="mt-3 inline-block px-3 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">
          Go Dashboard
        </a>
      </div>
    </div>
  );
};

export default NotFound;
