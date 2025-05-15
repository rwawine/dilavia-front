import type { ReactNode } from "react"
import styles from "./Card.module.css"

interface CardProps {
  children: ReactNode
  className?: string
}

export const Card = ({ children, className = "" }: CardProps) => {
  return <div className={`${styles.card} ${className}`}>{children}</div>
}

export default Card
