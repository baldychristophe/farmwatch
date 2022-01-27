import React, { ReactElement, useEffect } from 'react'
import tippy, { roundArrow } from 'tippy.js'

import 'tippy.js/dist/svg-arrow.css'
import 'tippy.js/themes/light.css'

export const UncontrolledTooltip = (props: { target: string, children: ReactElement }) => {
  useEffect(() => {
    const target = document.querySelector(`#${props.target}`)!
    const tooltip = document.getElementById(`tooltip-of-${props.target}`)!
    tooltip.style.display = 'block'
    tippy(target, {
      content: tooltip,
      allowHTML: true,
      arrow: roundArrow,
      theme: 'light',
      touch: true,
      duration: 100,
    })
  }, [props.target, props.children])
  return (
    <div id={ `tooltip-of-${props.target}` } role="tooltip" style={{ display: "none" }}>
      { props.children }
    </div>
  )
}
