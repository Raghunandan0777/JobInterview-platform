
import "./index.css";
import { ClerkProvider } from "@clerk/clerk-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

function App() {
  
  return (
    <>
    <h1>hello</h1>
   
      <SignedOut>
        <SignInButton mode='model' />
        <button className=''>Sign up please</button>
      </SignedOut>

      <SignedIn>
        <SignedOut/>
      </SignedIn>

      <UserButton />
    

     </>
  );
}

export default App