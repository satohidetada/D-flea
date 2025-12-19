"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase/config";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [purchasedItems, setPurchasedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/");
        return;
      }
      setUser(currentUser);

      // 自分が購入者(buyerId)になっている商品を検索
      const q = query(
        collection(db, "items"),
        where("buyerId", "==", currentUser.uid)
      );

      const unsubPurchases = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPurchasedItems(items);
        setLoading(false);
      });

      return () => unsubPurchases();
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    if (confirm("ログアウトしますか？")) {
      await signOut(auth);
      router.push("/");
    }
  };

  if (!user) return <div className="p-8 text-black">読み込み中...</div>;

  return (
    <div className="min-h-screen bg-white text-black p-4 pb-20">
      <header className="flex justify-between items-center mb-6">
        <Link href="/" className="text-red-600 font-bold text-xl tracking-tighter">NOMI</Link>
        <h1 className="text-lg font-bold">マイページ</h1>
      </header>

      {/* プロフィール表示 */}
      <div className="flex flex-col items-center py-6 border-b">
        <div className="w-20 h-20 bg-gray-200 rounded-full mb-3 overflow-hidden border">
          {user.photoURL && <img src={user.photoURL} alt="profile" />}
        </div>
        <h2 className="text-xl font-bold">{user.displayName}</h2>
        <p className="text-gray-500 text-sm">{user.email}</p>
      </div>

      {/* 購入した商品一覧（取引チャットへのリンク） */}
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <span className="mr-2">🛍️</span> 購入した商品（取引中）
        </h3>
        
        {loading ? (
          <p className="text-gray-400 text-sm">読み込み中...</p>
        ) : purchasedItems.length > 0 ? (
          <div className="space-y-3">
            {purchasedItems.map((item) => (
              <Link key={item.id} href={`/chat/${item.id}`}>
                <div className="flex items-center p-3 border rounded-xl hover:bg-gray-50 transition shadow-sm">
                  <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-lg mr-4" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{item.name}</p>
                    <p className="text-blue-600 text-xs mt-1">タップして取引メッセージを送る</p>
                  </div>
                  <span className="text-gray-300 text-xl font-light">〉</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed rounded-2xl bg-gray-50">
            <p className="text-gray-400 text-sm">購入した商品はまだありません</p>
            <Link href="/" className="text-red-500 text-sm font-bold mt-2 inline-block">商品を探しに行く</Link>
          </div>
        )}
      </div>

      <button 
        onClick={handleLogout}
        className="w-full mt-12 p-4 bg-gray-100 text-red-600 rounded-xl font-bold hover:bg-red-50 transition"
      >
        ログアウト
      </button>
    </div>
  );
}
