"use client";
import { auth, db } from "@/lib/firebase/config";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Header from "@/components/Header";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Firestoreにユーザー情報を保存（既存ユーザーなら上書きせずマージ）
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          prefecture: "未設定", // 初期値
          createdAt: serverTimestamp(),
        });
      }

      router.push("/"); // ログイン後トップへ
    } catch (error: any) {
      console.error(error);
      alert("ログインに失敗しました: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <Header />
      <main className="flex flex-col items-center justify-center pt-20 px-4">
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 text-center">
          <h1 className="text-3xl font-black text-red-600 mb-2 tracking-tighter">NOMI</h1>
          <p className="text-gray-400 text-sm font-bold mb-8 uppercase tracking-widest">Login to Market</p>
          
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 py-4 rounded-2xl font-bold hover:bg-gray-50 transition active:scale-95 shadow-sm"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
              {loading ? "接続中..." : "Googleでログイン"}
            </button>
          </div>

          <p className="mt-8 text-[10px] text-gray-400 font-medium leading-relaxed">
            ログインすることで、利用規約および<br />プライバシーポリシーに同意したものとみなされます。
          </p>
        </div>
      </main>
    </div>
  );
}