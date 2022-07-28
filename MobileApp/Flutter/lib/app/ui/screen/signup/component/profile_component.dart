import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/utils/flag/countries.dart';
import 'package:xoonit/app/utils/flag/country.dart';
import 'package:xoonit/app/utils/flag/utils.dart';
import 'package:xoonit/app/utils/flag/typedefs.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/core/ultils.dart';

///Provides a customizable [DropdownButton] for all countries
class CountryPickerDropdown extends StatefulWidget {
  CountryPickerDropdown({
    this.itemFilter,
    this.sortComparator,
    this.priorityList,
    this.itemBuilder,
    this.initialValue,
    this.onValuePicked,
    this.isExpanded = false,
  });

  final ItemFilter itemFilter;
  final Comparator<Country> sortComparator;
  final List<Country> priorityList;
  final ItemBuilder itemBuilder;
  final String initialValue;

  final ValueChanged<Country> onValuePicked;
  final bool isExpanded;

  @override
  _CountryPickerDropdownState createState() => _CountryPickerDropdownState();
}

class _CountryPickerDropdownState extends State<CountryPickerDropdown> {
  List<Country> _countries;
  Country _selectedCountry;

  @override
  void initState() {
    _countries =
        countryList.where(widget.itemFilter ?? acceptAllCountries).toList();

    if (widget.priorityList != null) {
      widget.priorityList.forEach((Country country) =>
          _countries.removeWhere((Country c) => country.isoCode == c.isoCode));
      _countries.insertAll(0, widget.priorityList);
    }

    if (widget.initialValue != null) {
      try {
        _selectedCountry = _countries.firstWhere(
          (country) => country.isoCode == widget.initialValue.toUpperCase(),
        );
      } catch (error) {
        throw Exception(
            "The initialValue provided is not a supported iso code!");
      }
    } else {
      _selectedCountry = _countries[0];
    }
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    List<DropdownMenuItem<Country>> items = _countries
        .map((country) => DropdownMenuItem<Country>(
            value: country,
            child: widget.itemBuilder != null
                ? widget.itemBuilder(country)
                : _buildDefaultMenuItem(country)))
        .toList();

    return Row(
      children: <Widget>[
        DropdownButton<Country>(
          isExpanded: widget.isExpanded,
          iconDisabledColor: MyColors.greenSpinerColor,
          iconEnabledColor: MyColors.greenSpinerColor,
          itemHeight: Dimension.height,
          dropdownColor: MyColors.primaryColor,
          style: Theme.of(context).primaryTextTheme.bodyText2,
          onChanged: (value) {
            setState(() {
              _selectedCountry = value;
              widget.onValuePicked(value);
            });
          },
          items: items,
          value: _selectedCountry,
        ),
      ],
    );
  }

  Widget _buildDefaultMenuItem(Country country) {
    return Row(
      children: <Widget>[
        CountryPickerUtils.getDefaultFlagImage(country),
        SizedBox(
          width: 3.0,
        ),
        Text(
          "(+${country.phoneCode})",
          style: MyStyleText.white12Bold,
        ),
      ],
    );
  }
}



