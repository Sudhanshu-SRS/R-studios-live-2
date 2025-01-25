import Navbar from './Navbar';

const AppLayout = ({ children }) => {
  return (
    <div>
      {/* Navbar Component */}
      <Navbar />

      {/* Main Content with padding to avoid overlap */}
      <main className="pt-20 sm:pt-24 lg:pt-28">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
