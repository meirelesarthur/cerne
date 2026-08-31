import { Icon } from '../components/ui/Icon'
import t from '../design/tokens'
import { findNavItemById } from '../data/menuData'
import { useNavigation } from '../context/NavigationContext'
import { useTheme } from '../context/ThemeContext'
import { useFavorites } from '../context/FavoritesContext'
import { Card } from '../components/ui/Card'
import { IconButton } from '../components/ui/IconButton'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'

export default function Favoritos() {
  const { navigateTo } = useNavigation()
  const { colors } = useTheme()
  const { favoriteIds, toggleFavorite } = useFavorites()

  const favoriteEntries = favoriteIds
    .map((id) => findNavItemById(id))
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)

  return (
    <div style={{ padding: `${t.space[6]}px ${t.space[6]}px`, maxWidth: 1400, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <PageHeader
        title="Favoritos"
        description="Suas funcionalidades favoritas, sempre à mão."
        count={favoriteEntries.length}
      />

      {favoriteEntries.length === 0 ? (
        <EmptyState
          icon={<Icon name="star" size={40} />}
          message="Você ainda não tem favoritos."
          description="Passe o mouse sobre um item do menu e clique na estrela para adicioná-lo aqui."
          action={{ label: 'Explorar Dashboards', onClick: () => navigateTo('dashboards') }}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: t.space[3],
          }}
        >
          {favoriteEntries.map(({ item, module }) => {
            const icon = item.icon
            return (
              <Card
                key={item.id}
                onClick={() => navigateTo(module.id, item.id)}
                style={{ position: 'relative' }}
              >
                <span
                  style={{ position: 'absolute', top: t.space[2], right: t.space[2] }}
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id) }}
                >
                  <IconButton
                    icon={<Icon name="star" size={13} color={t.color.feedback.warning.solid} filled />}
                    aria-label={`Remover ${item.label} dos favoritos`}
                    size="xs"
                  />
                </span>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    background: t.color.brand[100],
                    borderRadius: t.radius.lg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                  }}
                >
                  <Icon name={icon} size={19} color={t.color.brand[600]} />
                </div>
                <div style={{ fontSize: t.font.size.base, fontWeight: 600, color: colors.fg.default, marginBottom: 3, fontFamily: t.font.family.sans, paddingRight: t.space[5] }}>
                  {item.label}
                </div>
                <div style={{ fontSize: t.font.size.xs, color: colors.fg.muted, fontFamily: t.font.family.sans }}>
                  {module.label}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
