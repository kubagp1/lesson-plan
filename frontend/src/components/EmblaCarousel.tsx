import React, { Children, PropsWithChildren, useEffect, useRef } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import '../styles/embla.css'

type PropType = PropsWithChildren<{
  index: number
  onChange: (index: number) => void
}>

const EmblaCarousel: React.FC<PropType> = (props) => {
  const { index, onChange: setIndex, children } = props
  const startIndex = useRef(index)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    startIndex: startIndex.current
  })

  useEffect(() => {
    if (emblaApi) {
      const handleSelect = () => {
        setIndex(emblaApi.selectedScrollSnap())
      }

      emblaApi.on('select', handleSelect)

      return () => {
        emblaApi.off('select', handleSelect)
      }
    }
  }, [emblaApi, setIndex])

  useEffect(() => {
    if (emblaApi && emblaApi.selectedScrollSnap() !== index) {
      emblaApi.scrollTo(index)
    }
  }, [index, emblaApi])

  return (
    <div className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {Children.map(children, (child, i) => (
            <div className="embla__slide" key={i}>
              {child}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EmblaCarousel
