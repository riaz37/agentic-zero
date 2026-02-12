import { AgentCheckpoint } from '@agentic-zero/core'
import { ShadowDeepDive } from '@/components/ShadowDeepDive'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-black text-white">
      <AgentCheckpoint id="hero" narrative="Welcome to the Agentic Zero demo. This application demonstrates how an AI agent can navigate and interact with a web page. We are currently at the top of the page.">
        <section className="min-h-screen flex flex-col items-center justify-center border-b border-gray-700 w-full">
          <h1 className="text-6xl font-bold mb-8">Agentic Zero Demo</h1>
          <p className="text-xl max-w-2xl text-center mb-8">
            Experience the future of web interaction. Scroll down or ask the agent to navigate for you.
          </p>
          <button className="px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 transition">
            Get Started
          </button>
        </section>
      </AgentCheckpoint>

      <ShadowDeepDive />

      <AgentCheckpoint id="features" narrative="Our platform offers high-performance AI integration with zero latency overhead." priority={80}>
        <section className="min-h-screen flex flex-col items-center justify-center border-b border-gray-700 w-full">
          <h2 className="text-4xl font-bold mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full px-4">
            <div className="p-6 border border-gray-700 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">🧠 Brain Protocol</h3>
              <p>Deterministic state machine for robust agent behavior.</p>
            </div>
            <div className="p-6 border border-gray-700 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">🌉 Bridge Protocol</h3>
              <p>Secure connection between LLM and DOM.</p>
            </div>
            <div className="p-6 border border-gray-700 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">🎭 Visual Layer</h3>
              <p>Cinematic holographic avatars for immersive feedback.</p>
            </div>
          </div>
        </section>
      </AgentCheckpoint>

      <AgentCheckpoint id="pricing" narrative="This is the pricing section. We have three tiers: Starter, Pro, and Enterprise.">
        <section className="min-h-screen flex flex-col items-center justify-center border-b border-gray-700 w-full">
          <h2 className="text-4xl font-bold mb-12">Pricing Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full px-4">
            <div className="p-8 border border-gray-700 rounded-lg text-center">
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <p className="text-4xl font-bold mb-6">$0</p>
              <ul className="mb-6 space-y-2">
                <li>Feature A</li>
                <li>Feature B</li>
              </ul>
              <button className="w-full py-2 bg-gray-700 rounded hover:bg-gray-600">Select</button>
            </div>
            <div className="p-8 border border-blue-500 rounded-lg text-center relative">
              <span className="absolute top-0 right-0 bg-blue-500 text-xs px-2 py-1 rounded-bl">POPULAR</span>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-4xl font-bold mb-6">$29</p>
              <ul className="mb-6 space-y-2">
                <li>Everything in Starter</li>
                <li>Feature C</li>
              </ul>
              <button className="w-full py-2 bg-blue-600 rounded hover:bg-blue-700">Select</button>
            </div>
            <div className="p-8 border border-gray-700 rounded-lg text-center">
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <p className="text-4xl font-bold mb-6">Custom</p>
              <ul className="mb-6 space-y-2">
                <li>Everything in Pro</li>
                <li>Examples</li>
              </ul>
              <button className="w-full py-2 bg-gray-700 rounded hover:bg-gray-600">Contact Sales</button>
            </div>
          </div>
        </section>
      </AgentCheckpoint>

      <AgentCheckpoint id="contact" narrative="Get in touch with our team. For internal tracking, my agent session ID is SSN-999-00-1234 (this should be sanitized)." priority={50}>
        <section className="min-h-screen flex flex-col items-center justify-center w-full">
          <h2 className="text-4xl font-bold mb-12">Contact Us</h2>
          <form className="w-full max-w-md space-y-4">
            <div>
              <label className="block mb-1">Name</label>
              <input type="text" className="w-full p-2 bg-gray-900 border border-gray-700 rounded" />
            </div>
            <div>
              <label className="block mb-1">Email</label>
              <input type="email" className="w-full p-2 bg-gray-900 border border-gray-700 rounded" />
            </div>
            <div>
              <label className="block mb-1">Message</label>
              <textarea className="w-full p-2 bg-gray-900 border border-gray-700 rounded h-32"></textarea>
            </div>
            <button type="submit" className="w-full py-3 bg-green-600 rounded hover:bg-green-700">Send Message</button>
          </form>
        </section>
      </AgentCheckpoint>
    </main>
  );
}
