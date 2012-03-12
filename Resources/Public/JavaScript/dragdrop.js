document.observe("dom:loaded", function() {
	if ($$('.t3-page-columns .t3-page-column').length > 0) {
			// use default columns
		var columnContainer = $$('.t3-page-columns .t3-page-column');
	} else {
			// use backend layout
		var columnContainer = $$('div.t3-gridContainer .t3-gridCell');
	}

	columnContainer.each(function(container){
		if (container.id !== '') {
			return true;
		}

		var column = parseInt(container.className.replace(/.*t3-page-column-(\d*).*/gi, '$1'));
		var dragdropContainer = new Element('ul', {id: 'tx_dragdrop_container_' + column});
		dragdropContainer.addClassName('tx_dragdrop_container');
		container.insert(dragdropContainer);

		var contentElements = container.getElementsBySelector('div.t3-page-ce');

			// check for access rights to move content elements
		if (contentElements.length === 0 || contentElements[0].getElementsBySelector('.t3-page-ce-header .t3-page-ce-icons-move').length === 0) {
			return false;
		}

		contentElements.each(function(contentElement){
//			if (contentElement.up(0).hasClassName('contentElement')) {
//					// multicolum extension is not supported
//				return true;
//			}

			var t3Icon = contentElement.down('.t3-page-ce-body a span.t3-icon');
			if (t3Icon) {
				var uid = parseInt(t3Icon.title.replace(/.*?id=(\d*).*/g, '$1'));
				contentElement.id = 'tx_dragdrop_element_' + uid;

				var li = new Element('li', {
					id: contentElement.id
				});
				li.className = contentElement.className;
				li.addClassName('inactive').update(contentElement.innerHTML);

				li.observe('mouseover', function(){	this.addClassName('active').removeClassName('inactive'); });
				li.observe('mouseout', function(){ this.removeClassName('active').addClassName('inactive'); });

				var h4 = li.down('h4.t3-page-ce-header');
				var rowHeader = h4.down('.t3-row-header');
				rowHeader.setStyle({ position: 'absolute' });

				h4.addClassName('t3-row-header');
				h4.insert({before: rowHeader});

				dragdropContainer.insert(li);
				contentElement.remove();
			}
		});
	});

	var tx_dragdrop_containers = $$('.tx_dragdrop_container');
	tx_dragdrop_containers.each(function(tx_dragdrop_container){
		Sortable.create(tx_dragdrop_container, {
			tag: 'li',
			handle: 't3-page-ce-header',
			containment: tx_dragdrop_containers,
			dropOnEmpty: true,
			onUpdate: function(dragdropContainer) {
				var ajaxID = 'ajaxID=Dragdrop::changeOrderAction&';
				var column = 'col=' + dragdropContainer.id.split('_')[3] + '&';
				var uidOrder = Sortable.serialize(dragdropContainer, {
					name: 'uidOrder'
				});

				new Ajax.Request('/typo3/ajax.php', {
					postBody: ajaxID + column + uidOrder,
					onFailure: function(err) { alert('Error saving content positions (drag & drop)'); }
				});
			}
		});
	});
});