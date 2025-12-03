const EnvTest = () => {
  const streamKey = import.meta.env.VITE_STREAM_API_KEY;
  const apiUrl = import.meta.env.VITE_API_URL;
  const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  console.log('🔍 Environment Variables Check:');
  console.log('VITE_STREAM_API_KEY:', streamKey || '❌ MISSING');
  console.log('VITE_API_URL:', apiUrl || '❌ MISSING');
  console.log('VITE_CLERK_PUBLISHABLE_KEY:', clerkKey || '❌ MISSING');

  return (
    <div style={{ padding: '20px', background: '#f0f0f0', margin: '20px' }}>
      <h3>Environment Variables Status:</h3>
      <p>VITE_STREAM_API_KEY: {streamKey ? '✅ Loaded' : '❌ Missing'}</p>
      <p>VITE_API_URL: {apiUrl ? '✅ Loaded' : '❌ Missing'}</p>
      <p>VITE_CLERK_PUBLISHABLE_KEY: {clerkKey ? '✅ Loaded' : '❌ Missing'}</p>
      <p style={{ fontSize: '12px', color: '#666' }}>
        Check browser console for full values
      </p>
    </div>
  );
};

export default EnvTest;