import { SignIn } from '@clerk/nextjs'
import '@/app/sign.css'; 

export default function Page() {
  return (
    <div className="centered-container"> {/* 添加一个容器 */}
      <SignIn />
    </div>
  )
}