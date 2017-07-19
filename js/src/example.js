import widgets from 'jupyter-js-widgets';
import _ from 'underscore';
import $ from 'jquery';
import 'select2';

import Slick from './vendor/slickgrid-2.3.6';

export class DFWidgetModel extends widgets.DOMWidgetModel {
    defaults() {
        return {
            ...super.defaults(),
            _model_name: 'DFWidgetModel',
            _view_name: 'DFWidgetView',
            _model_module: 'dfedit',
            _view_module: 'dfedit',
            _model_module_version: '0.1.0',
            _view_module_version: '0.1.0',
            _columns: [],
            _data: []
        }
    }
};

export class StringsFilterModel extends widgets.DOMWidgetModel {
    defaults() {
        return {
            ...super.defaults(),
            _model_name: 'StringFilter',
            _view_name: 'StringFilterView',
            _model_module: 'dfedit',
            _view_module: 'dfedit',
            _column: null,
            filterValue: []
        }
    }
};


export class FiltersListModel extends widgets.VBoxModel {
    defaults() {
        return {
            ...super.defaults(),
            _model_name: 'StringFilter',
            _view_name: 'StringFilterView',
            _model_module: 'dfedit',
            _view_module: 'dfedit',
            children: [],
            box_style: ''
        }
    }
}

export class NewFilterModel extends widgets.DOMWidgetModel {
    defaults() {
        return {
            ...super.defaults(),
            _model_name: 'NewFiltersModel',
            _view_name: 'NewFiltersView',
            _model_module: 'dfedit',
            _view_module: 'dfedit',
        }
    }
}

export class TransformationsBoxModel extends widgets.DOMWidgetModel {
    defauts() {
        return {
            ...super.defaults(),
            _model_name: 'TransformationsBoxModel',
            _view_name: 'TransformationsBoxView',
            _model_module: 'dfedit',
            _view_module: 'dfedit'
        }
    }

    static serializers = {
        ...widgets.DOMWidgetModel.serializers,
        filters_list: {deserialize: widgets.unpack_models},
        new_filter: {deserialize: widgets.unpack_models}
    }
}

export class DFTransformerModel extends widgets.DOMWidgetModel {
    defaults() {
        return {
            ...super.defaults(),
            _model_name: 'DFTransformerModel',
            _view_name: 'DFTransformerView',
            _model_module: 'dfedit',
            _view_module: 'dfedit'
        }
    }

    static serializers = {
        ...widgets.DOMWidgetModel.serializers,
        dfviewer: {deserialize: widgets.unpack_models},
        transformations_box: {deserialize: widgets.unpack_models}
    }
}

export class DFWidgetView extends widgets.DOMWidgetView {
    render() {
        const columns = this.model.get('_columns');
        const slickColumns = columns.map(name => {
            return {id: name, name: name, field: name};
        });
        const slickData = this.model.get('_data').map(row => {
            return _.object(columns, row);
        });

        const options = {
            enableCellNavigation: true,
            enableColumnReorder: false
        };

        this.el.style.width = '600px';
        this.el.style.height = '400px';

        this.el.className += ' dfedit-table';

        const grid = new Slick.Grid(this.el, slickData, slickColumns, options);
    }
};

export class StringsFilterView extends widgets.DOMWidgetView {
    render() {
        this.el.style.width = '600px';
        this.el.style.height = '100px';

        this.$columnsSelect = this._renderColumnsSelect()
        this.$valuesSelect = this._renderOptionsSelect()
    }

    _renderColumnsSelect() {
        const options = this.model.get('_columns').map((column, index) => {
            return {
                id: index,
                text: column
            };
        });

        const select = document.createElement('select');
        this.el.appendChild(select);
        const $select = $(select).select2({data: options});
        $select.on('select2:select', (e) => this._onColumnChange())
        return $select
    }

    _renderOptionsSelect() {
        const options = this._getValueSelectOptions()
        const select = document.createElement('select');
        select.setAttribute('multiple', 'multiple');
        this.el.appendChild(select);
        const $select = $(select)
        this._initializeValueSelect($select, options);
        return $select
    }

    _onColumnChange() {
        const options = this._getValueSelectOptions()
        this._initializeValueSelect(this.$valuesSelect, options);
    }

    _getValueSelectOptions() {
        const columnSelected = this.$columnsSelect.val();
        const uniqueValues = this.model.get('_sample')[columnSelected];
        const options = uniqueValues.map(value => {
            return {
                id: value,
                text: value
            };
        });
        return options;
    }

    _initializeValueSelect($select, options) {
        $select.children("option").remove();
        $select.select2({tags: true, data: options});
    }
}

export class FiltersListView extends widgets.VBoxView {};

export class NewFilterView extends widgets.DOMWidgetView {
    render() {
        const transformations = this.model.get('transformations')
        const selectOptions = transformations.map(t => {
            return {
                id: t.transformationId,
                text: t.name
            };
        })

        const select = document.createElement('select');
        this.el.appendChild(select);
        const $select = $(select).select2({data: selectOptions});

        $select.on("select2:select", (e) => {
            this.send(
                {
                    event: 'select',
                    id: e.params.data.id
                }
            )
        });
    }
}

export class TransformationsBoxView extends widgets.DOMWidgetView {
    async render() {
        const filtersList = await this.create_child_view(this.model.get('filters_list'));
        const newFilter = await this.create_child_view(this.model.get('new_filter'));
        this.el.appendChild(filtersList.el);
        this.el.appendChild(newFilter.el);
    }
}

export class DFTransformerView extends widgets.DOMWidgetView {
    async render() {
        const transformationsBox = await this.create_child_view(
            this.model.get('transformations_box'));
        const dfViewer = await this.create_child_view(this.model.get('dfviewer'));
        this.el.appendChild(transformationsBox.el);
        this.el.appendChild(dfViewer.el);
    }
}
