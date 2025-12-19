"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, query, onSnapshot, doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [likedItems, setLikedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/");
        return;
      }
      setUser(currentUser);

      // いいねした商品のIDを取得し、その詳細を1つずつ取得する
      const likesRef = collection(db, "users", currentUser.uid, "likes");
      const unsubLikes = onSnapshot(likesRef, async (snapshot) => {
        const itemPromises = snapshot.docs.map(async (likeDoc) => {
          const itemDoc = await getDoc(doc(db, "items", likeDoc.id));
          return itemDoc.exists() ? { id: itemDoc.id, ...itemDoc.data() } : null;
        });
        const items = await Promise.all(itemPromises);
        setLikedItems(items.filter(i => i !== null));
        setLoading(false);
      });

      return () => unsubLikes();
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    if (confirm("本当にログアウトしますか？")) {
      await signOut(auth);
      router.push("/");
    }
  };

  if (!user) return <div className="p-8 text-black">読み込み中...</div>;

  return (
    <div className="min-h-screen bg-white text-black p-4">
      <header className="flex justify-between items-center mb-8">
        <Link href="/" className="text-red-600 font-bold text-xl tracking-tighter">NOMI</Link>
        <h1 className="text-lg font-bold">マイページ</h1>
      </header>

      {/* プロフィール */}
      <div className="flex flex-col items-center py-6 border-b">
        <div className="w-20 h-20 bg-gray-200 rounded-full mb-3 overflow-hidden border">
          {user.photoURL && <img src={user.photoURL} alt="profile" />}
        </div>
        <h2 className="text-xl font-bold">{user.displayName}</h2>
        <p className="text-gray-500 text-sm">{user.email}</p>
      </div>

      {/* メニューボタン（仮のリンク先を設定） */}
      <div className="mt-6 space-y-2">
        <Link href="/mypage/listings" className="block w-full text-left p-4 border rounded-lg font-medium hover:bg-gray-50 transition">
          📦 出品した商品
        </Link>
        <Link href="/mypage/purchases" className="block w-full text-left p-4 border rounded-lg font-medium hover:bg-gray-50 transition">
          🛍️ 購入した商品
        </Link>
      </div>

      {/* いいね！一覧セクション */}
      <div className="mt-10">
        <h3 className="text-lg font-bold mb-4 border-l-4 border-red-500 pl-2">❤️ いいね！一覧</h3>
        {loading ? (
          <p className="text-gray-400 text-sm">読み込み中...</p>
        ) : likedItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {likedItems.map((item) => (
              <Link key={item.id} href={`/items/${item.id}`}>
                <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-32 object-cover" />
                  <div className="p-2">
                    <p className="text-xs font-bold truncate">{item.name}</p>
                    <p className="text-red-600 font-bold text-sm">¥{item.price.toLocaleString()}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-10 text-sm">いいねした商品はありません</p>
        )}
      </div>
      
      <button 
        onClick={handleLogout}
        className="w-full mt-12 p-4 bg-gray-100 text-red-600 rounded-lg font-bold hover:bg-red-50 transition"
      >
        ログアウト
      </button>
    </div>
  );
}
