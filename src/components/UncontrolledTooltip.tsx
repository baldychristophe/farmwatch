import React, { ReactElement, useEffect } from 'react'
import tippy from 'tippy.js'

import 'tippy.js/themes/light.css'

export const UncontrolledTooltip = (props: { target: string, children: ReactElement }) => {
  useEffect(() => {
    const target = document.querySelector(`#${props.target}`)!
    const tooltip = document.getElementById(`tooltip-of-${props.target}`)!
    tooltip.style.display = 'block'
    tippy(target, {
      content: tooltip,
      allowHTML: true,
      arrow: true,
      theme: 'light',
      touch: true,
    })
  }, [props.target, props.children])
  return (
    <div id={ `tooltip-of-${props.target}` } role="tooltip" style={{ display: "none" }}>
      { props.children }
    </div>
  )
}
