import Image from "next/image"

const Hero = () => {
  return (
    <div className="flex flex-col items-start">
      <Image
        src="/opinio.svg"
        alt="hello"
        width={1000}
        height={1000}
        className="max-w-2xl w-full px-4 sm:px-6 md:px-8"
      />
      <div className="w-full max-w-2xl px-4 sm:px-6 md:px-8 py-4 flex flex-col items-end text-xl">
        <div className="flex items-center justify-end w-full gap-2">
          <span className="text-secondary text-sm sm:text-base">By</span>
          <Image
            src="/navlogo.png"
            alt="clapo logo"
            width={1000}
            height={1000}
            className="w-20 sm:w-24 md:w-28 h-auto"
          />
        </div>
        <div className="w-full text-left text-4xl sm:text-5xl md:text-6xl lg:text-7xl whitespace-nowrap">
          Trade Opinions
        </div>
      </div>
    </div>
  )
}

export default Hero
