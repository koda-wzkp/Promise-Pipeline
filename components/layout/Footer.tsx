import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-serif text-white text-lg mb-3">Promise Pipeline</h3>
            <p className="text-sm">
              A trust primitive for commitment networks. Open source under AGPL-3.0.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Demos</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/demo/hb2021" className="hover:text-white transition-colors">Oregon HB 2021</Link></li>
              <li><Link href="/demo/ai" className="hover:text-white transition-colors">AI Safety</Link></li>
              <li><Link href="/demo/infrastructure" className="hover:text-white transition-colors">Infrastructure SLAs</Link></li>
              <li><Link href="/demo/supply-chain" className="hover:text-white transition-colors">Supply Chain</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Products</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/personal" className="hover:text-white transition-colors">Promise Garden</Link></li>
              <li><Link href="/team" className="hover:text-white transition-colors">Teams</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>AGPL-3.0 License. Built on Promise Theory.</p>
        </div>
      </div>
    </footer>
  );
}
