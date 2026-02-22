import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, User, Briefcase, X } from 'lucide-react';

interface SearchDropdownProps {
    items: any[];
    onSelect: (item: any) => void;
    placeholder: string;
    searchKey: string;
    labelKey?: string;
    iconType?: 'user' | 'project';
    clearOnSelect?: boolean;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
    items,
    onSelect,
    placeholder,
    searchKey,
    labelKey = 'name',
    iconType = 'user',
    clearOnSelect = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredItems, setFilteredItems] = useState<any[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (searchTerm === '') {
            setFilteredItems(items);
        } else {
            const lowerSearch = searchTerm.toLowerCase();
            const filtered = items.filter(item => {
                const val = (item[searchKey] || '').toString().toLowerCase();
                // Specifically matching "starting with" as requested
                return val.startsWith(lowerSearch);
            });
            setFilteredItems(filtered);
        }
    }, [searchTerm, items, searchKey]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (item: any) => {
        onSelect(item);
        if (clearOnSelect) {
            setSearchTerm('');
        } else {
            setSearchTerm(item[labelKey]);
        }
        setIsOpen(false);
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {searchTerm ? (
                        <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600">
                            <X className="h-4 w-4" />
                        </button>
                    ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto">
                    {filteredItems.length > 0 ? (
                        <div className="py-1">
                            {filteredItems.map((item, idx) => (
                                <button
                                    key={item._id || item.id || idx}
                                    onClick={() => handleSelect(item)}
                                    className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center space-x-3 transition-colors"
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${iconType === 'user' ? 'bg-blue-500' : 'bg-emerald-500'
                                        }`}>
                                        {iconType === 'user' ? (
                                            <User size={14} />
                                        ) : (
                                            <Briefcase size={14} />
                                        )}
                                    </div>
                                    <div className="truncate">
                                        <p className="text-sm font-medium text-gray-900">{item[labelKey]}</p>
                                        {item.department && (
                                            <p className="text-xs text-gray-500">{item.department}</p>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="px-4 py-8 text-center text-gray-500 text-sm">
                            No results found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchDropdown;
