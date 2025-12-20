"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";

export default function MyPage() {
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        // 自分が作成した商品を取得
        const q = query(
          collection(db, "items"),
          where("sellerId", "==", u.uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (!user) return <div className="p-10 text-center text-black">読み込み中...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <Header />
      <main className="max-w-2xl mx-auto p-6">
        {/* プロフィールセクション */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-red-50 mb-4 bg-gray-100 shadow-inner">
            {user.photoURL ? (
              <img src={user.photoURL} className="w-full h-full object-cover" alt="" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">👤</div>
            )}
          </div>
          <h2 className="text-xl font-bold mb-1">{user.displayName || "名前未設定"}</h2>
          <p className="text-gray-400 text-xs mb-4">{user.email}</p>

          <div className="flex gap-3">
            {/* ★ プロフィール編集へのボタンを追加 */}
            <Link 
              href="/profile" 
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition"
            >
              プロフィールを編集
            </Link>
            
            <button 
              onClick={handleLogout}
              className="border border-gray-200 text-gray-400 px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-50 transition"
            >
              ログアウト
            </button>
          </div>
        </div>

        {/* 出品した商品セクション */}
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          📦 出品した商品 <span className="text-sm font-normal text-gray-400">({items.length})</span>
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {items.map((item) => (
            <Link href={`/items/${item.id}`} key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="relative aspect-square">
                <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
                {item.isSold && (
                  <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg">SOLD</div>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs text-gray-500 truncate">{item.name}</p>
                <p className="font-bold text-red-600">¥{item.price?.toLocaleString()}</p>
              </div>
            </Link>
          ))}
          {items.length === 0 && (
            <div className="col-span-2 py-10 text-center text-gray-400 text-sm bg-white rounded-3xl border border-dashed">
              まだ出品した商品はありません
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
