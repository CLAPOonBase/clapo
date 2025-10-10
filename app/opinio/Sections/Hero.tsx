import Image from "next/image"

const Hero = () => {
  return (
    <div className="flex flex-col items-start w-full">
      <div className="w-full px-4 sm:px-6 md:px-8 py-4">
        <h1 className="text-2xl font-bold text-white mb-2">Opinio</h1>
        <p className="text-gray-400 text-sm">Prediction Markets Platform</p>
      </div>
      <div className="w-full px-4 sm:px-6 md:px-8 py-2 flex flex-col items-end">
        <div className="flex items-center justify-end w-full gap-2">
          <span className="text-gray-400 text-sm sm:text-base">By</span>
          <Image
            src="/navlogo.png"
            alt="clapo logo"
            width={1000}
            height={1000}
            className="w-8 sm:w-8 md:w-8 h-auto"
          />
        </div>
      </div>
    </div>
  )
}

export default Hero
