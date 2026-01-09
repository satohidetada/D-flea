"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase/config";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged,
  sendEmailVerification,
  signOut,
  updateProfile // 追加
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // ログイン済み かつ メール認証済みの場合のみトップへ
      if (user && user.emailVerified) {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      alert("パスワードは6文字以上で設定してください");
      return;
    }
    setLoading(true);

    try {
      if (isRegister) {
        // --- 新規登録処理 ---
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const tempDisplayName = email.split("@")[0];

        // 1. Authプロフィール更新（メール内の %DISPLAY_NAME% 用）
        await updateProfile(user, {
          displayName: tempDisplayName
        });

        // 2. 認証メールを送信
        await sendEmailVerification(user);
        
        // 3. Firestoreに初期データと同意情報を登録
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: tempDisplayName,
          prefecture: "未設定",
          photoURL: "",
          createdAt: serverTimestamp(),
          termsAgreed: true,
          termsAgreedAt: serverTimestamp(),
        });

        // 4. 認証待ち状態にするため一旦ログアウト
        await signOut(auth);
        
        alert("確認メールを送信しました。メール内のURLをクリックして本登録を完了してください。");
        setIsRegister(false); // ログイン画面に切り替え

      } else {
        // --- ログイン処理 ---
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // メール認証チェック
        if (!user.emailVerified) {
          alert("メールアドレスの確認が取れていません。届いたメールのURLをクリックしてください。");
          await signOut(auth);
          return;
        }
      }
    } catch (error: any) {
      console.error(error);
      // 既存のエラー判定をすべて維持
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        alert("メールアドレスまたはパスワードが正しくありません。");
      } else if (error.code === "auth/email-already-in-use") {
        alert("このメールアドレスは既に登録されています。");
      } else if (error.code === "auth/invalid-email") {
        alert("メールアドレスの形式が正しくありません。");
      } else {
        alert("エラーが発生しました: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans">
      <Header />
      <main className="flex flex-col items-center justify-center pt-20 px-4">
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
          <h1 className="text-3xl font-black text-red-600 mb-2 text-center italic tracking-tighter">D-flea</h1>
          <p className="text-gray-400 text-[10px] font-bold mb-8 text-center uppercase tracking-[0.2em]">
            {isRegister ? "Create Account" : "Member Login"}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 ml-2 mb-1 block">EMAIL</label>
              <input
                type="email"
                placeholder="example@mail.com"
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-red-500/20 text-sm font-medium border border-transparent focus:border-red-100"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 ml-2 mb-1 block">PASSWORD</label>
              <input
                type="password"
                placeholder="6文字以上"
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-red-500/20 text-sm font-medium border border-transparent focus:border-red-100"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="px-2 pt-2 text-center text-[10px] leading-relaxed text-gray-400 font-bold">
              {isRegister ? "登録" : "ログイン"}ボタンを押すことで、当アプリの<br />
              <Link href="/terms" className="text-red-500 underline underline-offset-2">利用規約</Link>
              <span> および </span>
              <Link href="/privacy" className="text-red-500 underline underline-offset-2">プライバシーポリシー</Link>
              <br />に同意したものとみなされます。
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-red-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-red-200 transition active:scale-95 mt-2 ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-red-700"}`}
            >
              {loading ? "処理中..." : (isRegister ? "確認メールを送信する" : "同意してログイン")}
            </button>
          </form>

          <button
            onClick={() => setIsRegister(!isRegister)}
            className="w-full mt-6 text-xs text-gray-500 font-bold hover:text-red-600 transition text-center"
          >
            {isRegister ? "すでにアカウントをお持ちの方はこちら" : "新しくアカウントを作成する"}
          </button>
        </div>
      </main>
    </div>
  );
}