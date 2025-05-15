import type { FabricCategory, FabricCollection, FabricVariant } from "./types"

const API_BASE_URL = "https://66d77b122c6b09c7.mokky.dev"

/**
 * Получение всех категорий тканей
 */
export async function getFabricCategories(): Promise<FabricCategory[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/craft`, {
      next: { revalidate: 0 }, // Ревалидация каждый час
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    return data[0].categories || []
  } catch (error) {
    console.error("Error fetching fabric categories:", error)
    throw error // Пробрасываем ошибку выше для обработки в компонентах
  }
}

/**
 * Получение категории тканей по имени
 */
export async function getFabricCategoryByName(categoryName: string): Promise<FabricCategory | null> {
  try {
    const categories = await getFabricCategories()
    const category = categories.find((category) => category.name.toLowerCase() === categoryName.toLowerCase())

    return category || null
  } catch (error) {
    console.error(`Error fetching fabric category ${categoryName}:`, error)
    return null
  }
}

/**
 * Получение коллекции тканей по имени категории и коллекции
 */
export async function getFabricCollection(
  categoryName: string,
  collectionName: string,
): Promise<FabricCollection | null> {
  try {
    const category = await getFabricCategoryByName(categoryName)
    if (!category) return null

    // Decode URL-encoded collection name and normalize for comparison
    const decodedCollectionName = decodeURIComponent(collectionName)

    const collection = category.collections.find(
      (collection) =>
        collection.name.toLowerCase() === decodedCollectionName.toLowerCase() ||
        collection.name_ru.toLowerCase() === decodedCollectionName.toLowerCase(),
    )

    return collection || null
  } catch (error) {
    console.error(`Error fetching fabric collection ${collectionName}:`, error)
    return null
  }
}

/**
 * Фильтрация коллекций тканей по различным параметрам
 */
export async function filterFabricCollections(
  categoryName: string,
  filters: {
    collections?: string[]
    types?: string[]
    minAbrasion?: number
    maxAbrasion?: number
    availability?: string[]
  },
): Promise<FabricCollection[]> {
  try {
    const category = await getFabricCategoryByName(categoryName)
    if (!category) return []

    let filteredCollections = [...category.collections]

    // Фильтрация по названию коллекции
    if (filters.collections && filters.collections.length > 0) {
      filteredCollections = filteredCollections.filter((collection) =>
        filters.collections!.some((name) => collection.name_ru.toLowerCase().includes(name.toLowerCase())),
      )
    }

    // Фильтрация по типу ткани
    if (filters.types && filters.types.length > 0) {
      filteredCollections = filteredCollections.filter((collection) =>
        filters.types!.some((type) => collection.type.toLowerCase().includes(type.toLowerCase())),
      )
    }

    // Фильтрация по устойчивости к истиранию
    if (filters.minAbrasion !== undefined || filters.maxAbrasion !== undefined) {
      filteredCollections = filteredCollections.filter((collection) => {
        // Получаем числовое значение устойчивости к истиранию
        const abrasionText = collection.technicalSpecifications?.abrasionResistance || "0"
        const abrasionValue = Number.parseInt(abrasionText.replace(/\D/g, "")) || 0

        // Проверяем минимальное значение, если оно задано
        if (filters.minAbrasion !== undefined && abrasionValue < filters.minAbrasion) {
          return false
        }

        // Проверяем максимальное значение, если оно задано
        if (filters.maxAbrasion !== undefined && abrasionValue > filters.maxAbrasion) {
          return false
        }

        return true
      })
    }

    // Фильтрация по наличию
    if (filters.availability && filters.availability.length > 0) {
      filteredCollections = filteredCollections.filter((collection) =>
        filters.availability!.some((availability) =>
          collection.availability.toLowerCase().includes(availability.toLowerCase()),
        ),
      )
    }

    return filteredCollections
  } catch (error) {
    console.error("Error filtering fabric collections:", error)
    return []
  }
}

/**
 * Получение всех уникальных названий коллекций для категории
 */
export async function getFabricCollectionNames(categoryName: string): Promise<string[]> {
  try {
    const category = await getFabricCategoryByName(categoryName)
    if (!category) return []

    return category.collections.map((collection) => collection.name_ru)
  } catch (error) {
    console.error("Error fetching fabric collection names:", error)
    return []
  }
}

/**
 * Получение всех уникальных типов тканей для категории
 */
export async function getFabricTypes(categoryName: string): Promise<string[]> {
  try {
    const category = await getFabricCategoryByName(categoryName)
    if (!category) return []

    const types = new Set<string>()
    category.collections.forEach((collection) => {
      if (collection.type) {
        types.add(collection.type)
      }
    })

    return Array.from(types)
  } catch (error) {
    console.error("Error fetching fabric types:", error)
    return []
  }
}

/**
 * Получение всех уникальных значений наличия для категории
 */
export async function getFabricAvailabilities(categoryName: string): Promise<string[]> {
  try {
    const category = await getFabricCategoryByName(categoryName)
    if (!category) return []

    const availabilities = new Set<string>()
    category.collections.forEach((collection) => {
      if (collection.availability) {
        availabilities.add(collection.availability)
      }
    })

    return Array.from(availabilities)
  } catch (error) {
    console.error("Error fetching fabric availabilities:", error)
    return []
  }
}

/**
 * Получение варианта ткани по ID
 */
export async function getFabricVariantById(
  categoryName: string,
  collectionName: string,
  variantId: number,
): Promise<FabricVariant | null> {
  try {
    const collection = await getFabricCollection(categoryName, collectionName)
    if (!collection) return null

    return collection.variants.find((variant) => variant.id === variantId) || null
  } catch (error) {
    console.error(`Error fetching fabric variant ${variantId}:`, error)
    return null
  }
}

export async function getAllFabricCollections(categoryId: string) {
  try {
    const categories = await getFabricCategories()
    const category = categories.find((cat) => cat.name.toLowerCase() === categoryId.toLowerCase())

    if (!category || !category.collections) {
      return []
    }

    return category.collections
  } catch (error) {
    console.error("Error fetching all fabric collections:", error)
    return []
  }
}
