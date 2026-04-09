import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div>
      <Navbar />
      <Sidebar />
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
};

const styles = {
  main: {
    marginLeft: '240px',
    marginTop: '64px',
    padding: '24px',
    minHeight: 'calc(100vh - 64px)',
    backgroundColor: '#f0f4f8',
  },
};

export default Layout;