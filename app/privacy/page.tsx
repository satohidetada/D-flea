import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800 p-6 pb-20">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 border-b-2 border-blue-500 pb-2">プライバシーポリシー</h1>
        
        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="font-bold text-lg mb-2">1. 取得する情報</h2>
            <p>本アプリでは、ログイン時のGoogle/Firebase認証情報のほか、出品内容、メッセージ、評価等の情報を取得します。</p>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-2">2. 利用目的</h2>
            <p>取得した情報は、本人確認、取引の円滑化、および不具合・不正利用の調査のためにのみ利用します。</p>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-2">3. 第三者への提供</h2>
            <p>法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。ただし、認証基盤としてGoogle/Firebaseを利用しているため、各社の規約に基づき情報が取り扱われます。</p>
          </section>

          <div className="mt-10 pt-10 border-t text-center">
            <Link href="/mypage" className="text-blue-500 font-bold hover:underline">
              マイページに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}