import { interfaceFadeIn, interfaceFadeOut, setAllAligns, setGridAreas, removeSelection, gridOverlay } from './dom'
import { widgetStatesToData, isEditing, gridWidget } from './helpers'
import transitioner from '../../utils/transitioner'
import storage from '../../storage'

export default async function toggleWidget(data: Sync.Storage, widget: [Widgets, boolean]) {
	if (!widget) return

	const interfaceTransition = transitioner()
	const [id, on] = widget

	const layout = { ...data.move.layouts[data.move.selection] }
	const newgrid = gridWidget(layout.grid, data.move.selection, id, on)

	data.move.layouts[data.move.selection].grid = newgrid
	data = widgetStatesToData([[id, on]], data)
	storage.sync.set(data)

	interfaceTransition.first(() => {
		toggleWidgetInSettings([[id, on]])
		interfaceFadeOut()
	})

	interfaceTransition.then(async () => {
		setGridAreas(data.move.layouts[data.move.selection].grid)
		setAllAligns(data.move.layouts[data.move.selection].items)
		toggleWidgetOnInterface([[id, on]])
		removeSelection()

		// add/remove widget overlay only when editing move
		if (isEditing()) {
			on ? gridOverlay.add(id) : gridOverlay.remove(id)
		}
	})

	interfaceTransition.finally(interfaceFadeIn)
	interfaceTransition.transition(200)
}

function toggleWidgetInSettings(states: [Widgets, boolean][]) {
	const inputids: { [key in Widgets]: string } = {
		time: 'i_time',
		main: 'i_main',
		quicklinks: 'i_quicklinks',
		notes: 'i_notes',
		quotes: 'i_quotes',
		searchbar: 'i_sb',
	}

	for (const [widget, on] of states) {
		const input = document.getElementById(inputids[widget]) as HTMLInputElement
		const option = document.getElementById(widget + '_options')

		option?.classList.toggle('shown', on)
		input.checked = on
	}
}

function toggleWidgetOnInterface(states: [Widgets, boolean][]) {
	const domids: { [key in Widgets]: string } = {
		time: 'time',
		main: 'main',
		quicklinks: 'linkblocks',
		notes: 'notes_container',
		quotes: 'quotes_container',
		searchbar: 'sb_container',
	}

	for (const [widget, on] of states) {
		const elem = document.getElementById(domids[widget]) as HTMLElement
		elem?.classList.toggle('hidden', !on)
	}
}
