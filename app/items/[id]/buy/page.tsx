"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase/config"; // configに統一
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";

export default function BuyConfirm() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, "items", id)).then(s => s.exists() && setItem({ id: s.id, ...s.data() }));
  }, [id]);

  const handleBuy = async () => {
    // auth.currentUser をその場で取得
    const currentUser = auth.currentUser;
    if (!currentUser || !item) {
      alert("ログイン状態が確認できません。再度ログインしてください。");
      return;
    }

    setLoading(true);
    try {
      // 1. 商品を売り切れ状態に更新
      await updateDoc(doc(db, "items", id), {
        status: "sold",
        isSold: true,
        buyerId: currentUser.uid,
        soldAt: serverTimestamp(),
      });

      // 2. チャットルームの土台を作成
      await setDoc(doc(db, "chats", id), {
        itemId: id,
        itemName: item.name,
        sellerId: item.sellerId,
        buyerId: currentUser.uid,
        updatedAt: serverTimestamp(),
        lastMessage: "購入されました！"
      }, { merge: true });

      alert("購入が完了しました！取引チャットへ移動します。");

      // 3. チャット画面へ移動
      router.push(`/chat/${id}`);

    } catch (error: any) {
      console.error("Purchase Error:", error);
      alert("購入に失敗しました: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!item) return <div className="p-10 text-center text-black">読み込み中...</div>;

  return (
    <main className="min-h-screen bg-gray-50 text-black">
      <div className="bg-white p-4 border-b flex items-center">
        <button onClick={() => router.back()} className="text-xl mr-4 text-gray-400">←</button>
        <h1 className="font-bold">購入内容の確認</h1>
      </div>

      <div className="p-4 bg-white mb-2 flex gap-4">
        {item.imageUrl && <img src={item.imageUrl} className="w-20 h-20 object-cover rounded" alt="" />}
        <div>
          <p className="font-bold text-sm">{item.name}</p>
          <p className="font-bold text-lg text-red-600">¥{Number(item.price).toLocaleString()}</p>
        </div>
      </div>

      <div className="p-8">
        <button 
          onClick={handleBuy}
          disabled={loading || item.isSold}
          className="w-full bg-red-500 text-white font-bold py-4 rounded-lg shadow-lg active:scale-95 transition disabled:bg-gray-300"
        >
          {loading ? "購入処理中..." : "購入を確定する"}
        </button>
      </div>
    </main>
  );
}
