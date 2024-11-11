import { SignUp } from '@clerk/nextjs'
import '@/app/sign.css';

export default function Page() {
  return (
    <div className="centered-container">
      <SignUp />
    </div>
  )
}