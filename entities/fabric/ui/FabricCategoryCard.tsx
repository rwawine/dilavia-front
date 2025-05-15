import Link from "next/link"
import Image from "next/image"
import styles from "./FabricCategoryCard.module.css"
import type { FabricCategory } from "@/shared/api/types"

// Add this helper function at the top of the file (before the component)
const getImageUrl = (category: FabricCategory): string => {
  // If the category has collections with variants, use the first variant's image
  if (
    category.collections &&
    category.collections.length > 0 &&
    category.collections[0].variants &&
    category.collections[0].variants.length > 0
  ) {
    return `/${category.collections[0].variants[0].image}`
  }

  // Fallback to a placeholder
  return `/placeholder.svg?height=300&width=300&query=fabric%20${category.name}`
}

interface FabricCategoryCardProps {
  category: FabricCategory
  className?: string
}

export const FabricCategoryCard = ({ category, className = "" }: FabricCategoryCardProps) => {
  // Получаем первое изображение из первой коллекции для превью категории
  const previewImage = category.collections[0]?.variants[0]?.image || "/assorted-fabrics.png"

  return (
    <Link href={`/fabrics/${category.name.toLowerCase()}`} className={`${styles.card} ${className}`}>
      <div className={styles.imageContainer}>
        <Image
          src={getImageUrl(category) || "/placeholder.svg"}
          alt={category.name_ru}
          width={300}
          height={300}
          className={styles.image}
        />
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{category.name_ru}</h3>
        {category.description_ru && <p className={styles.description}>{category.description_ru}</p>}
        <div className={styles.collectionsCount}>
          {category.collections.length} {getCollectionsText(category.collections.length)}
        </div>
      </div>
    </Link>
  )
}

// Функция для правильного склонения слова "коллекция"
function getCollectionsText(count: number): string {
  const lastDigit = count % 10
  const lastTwoDigits = count % 100

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return "коллекций"
  }

  if (lastDigit === 1) {
    return "коллекция"
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return "коллекции"
  }

  return "коллекций"
}

export default FabricCategoryCard
