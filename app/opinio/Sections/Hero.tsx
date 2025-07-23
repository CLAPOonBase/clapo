import Image from "next/image"

const Hero = () => {
  return (
    <div className="flex flex-col items-start">
      <Image
        src="/opinio.svg"
        alt="hello"
        width={1000}
        height={1000}
        className="max-w-2xl px-8"
      />
      <div className="w-full max-w-2xl px-8 py-4 flex flex-col items-end text-xl">
        <div className="flex">
 <span className="text-secondary">By</span>
        <Image
          src="/navlogo.png"
          alt="clapo logo"
          width={1000}
          height={1000}
          className="w-28 h-auto"
        />
        </div>
       <div className=" w-full text-7xl text-left text-nowrap">
        Trade Opinions
       </div>
      </div>
    </div>
  )
}

export default Hero
